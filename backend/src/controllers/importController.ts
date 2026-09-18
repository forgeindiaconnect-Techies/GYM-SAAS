import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import multer from 'multer';
import * as XLSX from 'xlsx';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User, { Role, ApprovalStatus } from '../models/User';
import Branch from '../models/Branch';
import Trainer from '../models/Trainer';
import CustomerMembership, { CustomerMembershipStatus } from '../models/CustomerMembership';
import ImportHistory, { ImportStatus } from '../models/ImportHistory';
import Gym from '../models/Gym';

// ─── Multer config (memory storage, 10 MB limit) ────────────────────────────
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel', // xls
      'text/csv',
      'application/csv',
      'text/plain',
    ];
    if (
      allowed.includes(file.mimetype) ||
      file.originalname.match(/\.(xlsx|xls|csv)$/i)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) and CSV files are allowed'));
    }
  },
});

// ─── Column header aliases (handles different capitalizations / spaces) ──────
const COLUMN_MAP: Record<string, string> = {
  'customer name': 'customerName',
  'name': 'customerName',
  'full name': 'customerName',
  'email': 'email',
  'email address': 'email',
  'mobile': 'mobile',
  'mobile number': 'mobile',
  'phone': 'mobile',
  'phone number': 'mobile',
  'gender': 'gender',
  'date of birth': 'dateOfBirth',
  'dob': 'dateOfBirth',
  'height': 'height',
  'height (cm)': 'height',
  'weight': 'weight',
  'weight (kg)': 'weight',
  'membership plan': 'membershipPlan',
  'plan': 'membershipPlan',
  'plan name': 'membershipPlan',
  'membership start date': 'membershipStartDate',
  'start date': 'membershipStartDate',
  'membership end date': 'membershipEndDate',
  'end date': 'membershipEndDate',
  'branch': 'branch',
  'branch name': 'branch',
  'trainer': 'trainer',
  'trainer name': 'trainer',
  'status': 'status',
  'membership status': 'status',
  'emergency contact': 'emergencyContact',
  'emergency contact name': 'emergencyContact',
};

// ─── Validation helpers ──────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$|^\d{10}$|^\+\d{10,14}$/;
const VALID_GENDERS = ['male', 'female', 'other', 'prefer not to say'];
const VALID_STATUSES = ['active', 'inactive', 'pending', 'expired', 'cancelled'];

function parseDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === 'number') {
    // Excel serial date number
    const d = XLSX.SSF.parse_date_code(val);
    if (d) return new Date(d.y, d.m - 1, d.d);
  }
  
  const str = String(val).trim();
  
  // Try to parse DD/MM/YYYY or DD-MM-YYYY or YYYY-MM-DD
  const parts = str.split(/[\/\-]/);
  if (parts.length === 3) {
    let p1 = parseInt(parts[0], 10);
    let p2 = parseInt(parts[1], 10);
    let p3 = parseInt(parts[2], 10);
    
    if (!isNaN(p1) && !isNaN(p2) && !isNaN(p3)) {
      let y, m, d;
      if (p1 > 1000) {
        // YYYY-MM-DD
        y = p1; m = p2; d = p3;
      } else if (p3 > 1000) {
        // Either DD/MM/YYYY or MM/DD/YYYY
        y = p3;
        if (p2 > 12) {
          // MM/DD/YYYY
          m = p1; d = p2;
        } else {
          // Default to DD/MM/YYYY (most common globally and in India)
          d = p1; m = p2;
        }
      }
      if (y && m && d) {
        const parsedDate = new Date(y, m - 1, d);
        if (!isNaN(parsedDate.getTime())) return parsedDate;
      }
    }
  }

  // Fallback to standard JS Date parser
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function normalizeHeader(h: string): string {
  return h.toString().trim().toLowerCase().replace(/\s+/g, ' ');
}

// ─── Parse Excel/CSV buffer → array of raw row objects ──────────────────────
function parseFileBuffer(buffer: Buffer, mimetype: string): any[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });

  // Normalize headers
  return rows.map((row) => {
    const normalized: Record<string, any> = {};
    for (const key of Object.keys(row)) {
      const mapped = COLUMN_MAP[normalizeHeader(key)];
      if (mapped) normalized[mapped] = row[key];
    }
    return normalized;
  });
}

// ─── Validate a single row ───────────────────────────────────────────────────
interface RowValidation {
  errors: string[];
  warnings: string[];
  parsed: Record<string, any>;
}

function validateRow(row: Record<string, any>, rowIndex: number): RowValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const parsed: Record<string, any> = { ...row };

  // Required: name
  const rawName = (row.customerName || '').toString().trim();
  if (!rawName) errors.push('Customer Name is required');
  else {
    const parts = rawName.split(/\s+/);
    parsed.firstName = parts[0];
    parsed.lastName = parts.slice(1).join(' ') || 'N/A';
  }

  // Required: email
  const email = (row.email || '').toString().trim().toLowerCase();
  if (!email) errors.push('Email is required');
  else if (!EMAIL_RE.test(email)) errors.push(`Invalid email format: "${email}"`);
  parsed.email = email;

  // Required: mobile
  const mobile = (row.mobile || '').toString().trim().replace(/[\s\-().]/g, '');
  if (!mobile) errors.push('Mobile Number is required');
  else if (!MOBILE_RE.test(mobile)) errors.push(`Invalid mobile number format: "${mobile}"`);
  parsed.mobile = mobile;

  // Gender
  const gender = (row.gender || '').toString().trim();
  if (gender) {
    const g = gender.toLowerCase();
    if (!VALID_GENDERS.includes(g)) {
      errors.push(`Invalid gender: "${gender}". Must be Male, Female, Other, or Prefer not to say`);
    } else {
      parsed.gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
      if (parsed.gender === 'Prefer not to say') parsed.gender = 'Prefer not to say';
    }
  }

  // Date of birth
  if (row.dateOfBirth) {
    const dob = parseDate(row.dateOfBirth);
    if (!dob) errors.push(`Invalid Date of Birth format: "${row.dateOfBirth}"`);
    else parsed.dateOfBirth = dob;
  }

  // Height
  if (row.height) {
    const h = parseFloat(String(row.height));
    if (isNaN(h) || h <= 0 || h > 300) errors.push(`Invalid height: "${row.height}". Must be a number in cm (e.g. 175)`);
    else parsed.height = h;
  }

  // Weight
  if (row.weight) {
    const w = parseFloat(String(row.weight));
    if (isNaN(w) || w <= 0 || w > 600) errors.push(`Invalid weight: "${row.weight}". Must be a number in kg`);
    else parsed.weight = w;
  }

  // Membership start/end dates
  if (row.membershipStartDate) {
    const sd = parseDate(row.membershipStartDate);
    if (!sd) errors.push(`Invalid Membership Start Date: "${row.membershipStartDate}"`);
    else parsed.membershipStartDate = sd;
  }
  if (row.membershipEndDate) {
    const ed = parseDate(row.membershipEndDate);
    if (!ed) errors.push(`Invalid Membership End Date: "${row.membershipEndDate}"`);
    else parsed.membershipEndDate = ed;
  }
  if (parsed.membershipStartDate && parsed.membershipEndDate && parsed.membershipEndDate < parsed.membershipStartDate) {
    errors.push('Membership End Date must be after Start Date');
  }

  // Status
  if (row.status) {
    const s = row.status.toString().trim().toLowerCase();
    if (!VALID_STATUSES.includes(s)) {
      warnings.push(`Unknown status "${row.status}" — will default to "Active"`);
      parsed.status = 'Active';
    } else {
      parsed.status = row.status.toString().trim().charAt(0).toUpperCase() + s.slice(1);
    }
  } else {
    parsed.status = 'Active';
  }

  return { errors, warnings, parsed };
}

// ─── POST /api/import/validate ───────────────────────────────────────────────
export const validateImport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    if (!gymId) {
      res.status(403).json({ success: false, message: 'No gym associated with this account' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    // Parse file
    let rawRows: any[];
    try {
      rawRows = parseFileBuffer(req.file.buffer, req.file.mimetype);
    } catch (e: any) {
      res.status(400).json({ success: false, message: `Failed to parse file: ${e.message}` });
      return;
    }

    if (rawRows.length === 0) {
      res.status(400).json({ success: false, message: 'The file is empty or has no data rows' });
      return;
    }

    if (rawRows.length > 5000) {
      res.status(400).json({ success: false, message: 'File exceeds 5,000 rows limit. Please split into smaller files.' });
      return;
    }

    // Fetch branches and trainers for this gym
    const [branches, trainers] = await Promise.all([
      Branch.find({ gymId }).select('_id branchName'),
      Trainer.find({ gymId, status: 'Active' }).select('_id name email branchId'),
    ]);

    const branchMap = new Map<string, string>(); // name.toLowerCase() → _id
    branches.forEach(b => branchMap.set(b.branchName.toLowerCase().trim(), b._id.toString()));

    const trainerMap = new Map<string, { id: string; branchId?: string }>(); // name.toLowerCase() → { id, branchId }
    trainers.forEach(t => trainerMap.set(t.name.toLowerCase().trim(), { id: t._id.toString(), branchId: t.branchId?.toString() }));

    // Track seen emails/mobiles within file for in-file duplicate detection
    const seenEmails = new Map<string, number>(); // email → first row number
    const seenMobiles = new Map<string, number>();

    // Collect all emails/mobiles to do one DB lookup
    const allEmails: string[] = [];
    const allMobiles: string[] = [];

    const preValidated: Array<{ row: Record<string, any>; rowIndex: number; validation: RowValidation }> = [];

    for (let i = 0; i < rawRows.length; i++) {
      const validation = validateRow(rawRows[i], i + 2); // +2 for header row
      preValidated.push({ row: rawRows[i], rowIndex: i + 2, validation });
      if (validation.parsed.email) allEmails.push(validation.parsed.email);
      if (validation.parsed.mobile) allMobiles.push(validation.parsed.mobile);
    }

    // Bulk DB lookup for existing customers in this gym
    const existingUsers = await User.find({
      gymId,
      $or: [
        { email: { $in: allEmails } },
        { mobile: { $in: allMobiles } },
      ],
    }).select('_id email mobile firstName lastName gender dateOfBirth height weight');

    const existingEmailMap = new Map<string, any>(); // email → user doc
    const existingMobileMap = new Map<string, any>(); // mobile → user doc
    existingUsers.forEach(u => {
      existingEmailMap.set(u.email.toLowerCase(), u);
      existingMobileMap.set(u.mobile, u);
    });

    const existingMemberships = await CustomerMembership.find({
      userId: { $in: existingUsers.map(u => u._id) },
      gymId,
      status: { $in: [CustomerMembershipStatus.ACTIVE, CustomerMembershipStatus.PENDING_VERIFICATION] },
    });
    const membershipMap = new Map<string, any>();
    existingMemberships.forEach(m => membershipMap.set(m.userId.toString(), m));

    // Build result rows
    type RowStatus = 'valid' | 'error' | 'duplicate' | 'existing';
    interface ResultRow {
      rowNumber: number;
      data: Record<string, any>;
      status: RowStatus;
      errors: string[];
      warnings: string[];
      existingUserId?: string;
      existingUserName?: string;
      existingData?: Record<string, any>;
      branchId?: string;
      trainerId?: string;
      action: 'import' | 'skip' | 'update' | 'none';
    }

    const results: ResultRow[] = [];

    for (const { row, rowIndex, validation } of preValidated) {
      const { errors, warnings, parsed } = validation;
      let status: RowStatus = errors.length > 0 ? 'error' : 'valid';
      let existingUserId: string | undefined;
      let existingUserName: string | undefined;
      let action: ResultRow['action'] = 'import';

      // Branch validation — warning only (customer still imports, branch left unassigned)
      let branchId: string | undefined;
      if (parsed.branch) {
        const bKey = parsed.branch.toString().toLowerCase().trim();
        if (branchMap.has(bKey)) {
          branchId = branchMap.get(bKey);
        } else {
          const available = [...branchMap.keys()];
          warnings.push(
            `Branch "${parsed.branch}" not found in this gym — customer will be imported without branch assignment.` +
            (available.length ? ` Available branches: ${available.join(', ')}` : ' No branches configured yet.')
          );
          // NOT setting status = 'error' — this is a soft warning only
        }
      }

      // Trainer validation
      let trainerId: string | undefined;
      if (parsed.trainer) {
        const tKey = parsed.trainer.toString().toLowerCase().trim();
        if (trainerMap.has(tKey)) {
          const tData = trainerMap.get(tKey)!;
          trainerId = tData.id;
          // If branch specified and trainer not in that branch, warn
          if (branchId && tData.branchId && tData.branchId !== branchId) {
            warnings.push(`Trainer "${parsed.trainer}" is assigned to a different branch`);
          }
        } else {
          warnings.push(`Trainer "${parsed.trainer}" not found — trainer assignment will be skipped`);
        }
      }

      // In-file duplicate detection (only if no validation errors on email/mobile)
      if (status !== 'error' || (parsed.email && parsed.mobile)) {
        const emailKey = parsed.email || '';
        const mobileKey = parsed.mobile || '';

        if (emailKey) {
          if (seenEmails.has(emailKey)) {
            status = 'duplicate';
            errors.push(`Duplicate email in file — first seen at row ${seenEmails.get(emailKey)}`);
            action = 'none';
          } else {
            seenEmails.set(emailKey, rowIndex);
          }
        }

        if (mobileKey && status !== 'duplicate') {
          if (seenMobiles.has(mobileKey)) {
            status = 'duplicate';
            errors.push(`Duplicate mobile number in file — first seen at row ${seenMobiles.get(mobileKey)}`);
            action = 'none';
          } else {
            seenMobiles.set(mobileKey, rowIndex);
          }
        }

        // Existing customer detection (DB check)
        if (status === 'valid' || status === 'error') {
          const byEmail = emailKey ? existingEmailMap.get(emailKey) : null;
          const byMobile = mobileKey ? existingMobileMap.get(mobileKey) : null;
          const existing = byEmail || byMobile;
          if (existing) {
            status = 'existing';
            existingUserId = existing._id.toString();
            existingUserName = `${existing.firstName} ${existing.lastName}`;
            action = 'skip'; // default: skip existing
          }
        }
      }

      let existingData: Record<string, any> | undefined = undefined;
      if (existingUserId) {
        const existing = existingEmailMap.get(parsed.email || '') || existingMobileMap.get(parsed.mobile || '');
        const existingMembership = membershipMap.get(existingUserId);
        let branchName = undefined;
        if (existingMembership?.branchId) {
          const branch = branches.find(b => b._id.toString() === existingMembership.branchId.toString());
          branchName = branch?.branchName;
        }
        existingData = {
          planName: existingMembership?.planName,
          branchName: branchName,
          gender: existing?.gender,
          dateOfBirth: existing?.dateOfBirth,
          height: existing?.height,
          weight: existing?.weight,
        };
      }

      if (status === 'error') action = 'none';

      results.push({
        rowNumber: rowIndex,
        data: parsed,
        status,
        errors,
        warnings,
        existingUserId,
        existingUserName,
        existingData,
        branchId,
        trainerId,
        action,
      });
    }

    // Summary
    const summary = {
      total: results.length,
      valid: results.filter(r => r.status === 'valid').length,
      error: results.filter(r => r.status === 'error').length,
      duplicate: results.filter(r => r.status === 'duplicate').length,
      existing: results.filter(r => r.status === 'existing').length,
      newCustomers: results.filter(r => r.status === 'valid').length,
    };

    res.status(200).json({
      success: true,
      fileName: req.file.originalname,
      summary,
      rows: results,
    });
  } catch (error: any) {
    console.error('Import validate error:', error);
    res.status(500).json({ success: false, message: 'Server error during validation', error: error.message });
  }
};

// ─── POST /api/import/execute ────────────────────────────────────────────────
export const executeImport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    const userId = req.user?.id;
    if (!gymId || !userId) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { fileName, rows } = req.body as {
      fileName: string;
      rows: Array<{
        rowNumber: number;
        data: Record<string, any>;
        status: string;
        errors: string[];
        warnings: string[];
        existingUserId?: string;
        branchId?: string;
        trainerId?: string;
        action: 'import' | 'skip' | 'update' | 'none';
      }>;
    };

    if (!rows || !Array.isArray(rows)) {
      res.status(400).json({ success: false, message: 'rows array is required' });
      return;
    }

    // Create import history record
    const importRecord = new ImportHistory({
      gymId,
      importedBy: userId,
      fileName: fileName || 'import.xlsx',
      status: ImportStatus.PROCESSING,
      totalRecords: rows.length,
    });
    await importRecord.save();

    let newCustomers = 0;
    let updatedCustomers = 0;
    let skippedCustomers = 0;
    let failedRecords = 0;
    const failedRows: any[] = [];
    const successfulCustomers: any[] = [];

    for (const row of rows) {
      try {
        const { data, action, existingUserId, branchId, trainerId } = row;

        // Skip rows marked as skip/none/duplicate/error
        if (action === 'none' || action === 'skip') {
          skippedCustomers++;
          continue;
        }

        if (action === 'update' && existingUserId) {
          // Update existing customer
          const updateData: any = {};
          if (data.firstName) updateData.firstName = data.firstName;
          if (data.lastName && data.lastName !== 'N/A') updateData.lastName = data.lastName;
          if (data.gender) updateData.gender = data.gender;
          if (data.dateOfBirth) updateData.dateOfBirth = data.dateOfBirth;
          if (data.height) updateData.height = data.height;
          if (data.weight) updateData.weight = data.weight;
          if (data.mobile) updateData.mobile = data.mobile;
          if (branchId) updateData.branchId = branchId;
          if (trainerId) updateData.trainerId = trainerId;

          await User.findByIdAndUpdate(existingUserId, { $set: updateData });

          // Update membership if plan/dates provided
          if (data.membershipPlan && data.membershipStartDate) {
            const existingMembership = await CustomerMembership.findOne({
              userId: existingUserId,
              gymId,
            }).sort({ createdAt: -1 });

            if (existingMembership) {
              existingMembership.planName = data.membershipPlan;
              if (data.membershipStartDate) existingMembership.startDate = new Date(data.membershipStartDate);
              if (data.membershipEndDate) existingMembership.endDate = new Date(data.membershipEndDate);
              const statusMap: any = { active: CustomerMembershipStatus.ACTIVE, expired: CustomerMembershipStatus.EXPIRED, cancelled: CustomerMembershipStatus.CANCELLED };
              if (data.status) existingMembership.status = statusMap[data.status?.toLowerCase()] || CustomerMembershipStatus.ACTIVE;
              await existingMembership.save();
            }
          }

          successfulCustomers.push({
            id: existingUserId,
            name: `${data.firstName || ''} ${data.lastName !== 'N/A' ? data.lastName : ''}`.trim(),
            email: data.email,
            phone: data.mobile,
            plan: data.membershipPlan,
            status: data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase() : 'Active',
            joined: data.membershipStartDate ? new Date(data.membershipStartDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            customerType: 'EXISTING_CUSTOMER',
            trainer: data.trainer,
            gender: data.gender,
            dob: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : undefined,
            emergencyName: data.emergencyContact,
          });

          updatedCustomers++;
          continue;
        }

        if (action === 'import') {
          // Create new customer account
          const tempPassword = crypto.randomBytes(16).toString('hex');
          const salt = await bcrypt.genSalt(10);
          const passwordHash = await bcrypt.hash(tempPassword, salt);

          // Double-check no duplicate
          const existing = await User.findOne({
            $or: [{ email: data.email }, { mobile: data.mobile }],
          });
          if (existing) {
            // Edge case: became duplicate between validate and execute
            skippedCustomers++;
            continue;
          }

          const newUser = new User({
            firstName: data.firstName || 'Unknown',
            lastName: data.lastName || 'N/A',
            email: data.email,
            mobile: data.mobile,
            passwordHash,
            role: Role.MEMBER,
            gymId,
            isActive: true,
            approvalStatus: ApprovalStatus.APPROVED,
            customerType: 'EXISTING_CUSTOMER',
            gender: data.gender,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
            height: data.height,
            weight: data.weight,
            emergencyContact: data.emergencyContact ? { name: data.emergencyContact, relationship: '', mobile: '' } : undefined,
          });

          await newUser.save();

          // Create membership
          if (data.membershipPlan) {
            const statusMap: Record<string, CustomerMembershipStatus> = {
              active: CustomerMembershipStatus.ACTIVE,
              expired: CustomerMembershipStatus.EXPIRED,
              cancelled: CustomerMembershipStatus.CANCELLED,
              inactive: CustomerMembershipStatus.EXPIRED,
              pending: CustomerMembershipStatus.PENDING_VERIFICATION,
            };
            const membershipStatus = statusMap[(data.status || 'active').toLowerCase()] || CustomerMembershipStatus.ACTIVE;

            const membership = new CustomerMembership({
              userId: newUser._id,
              gymId,
              branchId: branchId || undefined,
              planName: data.membershipPlan,
              duration: 'Imported',
              price: 0,
              discount: 0,
              finalAmount: 0,
              paymentMethod: 'Imported',
              status: membershipStatus,
              startDate: data.membershipStartDate ? new Date(data.membershipStartDate) : undefined,
              endDate: data.membershipEndDate ? new Date(data.membershipEndDate) : undefined,
            });
            await membership.save();
          }

          // Log invitation (no email service yet — log temp password to server console for demo)
          console.log(`[IMPORT] New customer created: ${data.email} | Temp password (to be emailed): ${tempPassword}`);

          successfulCustomers.push({
            id: newUser._id.toString(),
            name: `${newUser.firstName} ${newUser.lastName !== 'N/A' ? newUser.lastName : ''}`.trim(),
            email: newUser.email,
            phone: newUser.mobile,
            plan: data.membershipPlan,
            status: data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase() : 'Active',
            joined: data.membershipStartDate ? new Date(data.membershipStartDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            customerType: 'EXISTING_CUSTOMER',
            trainer: data.trainer,
            gender: newUser.gender,
            dob: newUser.dateOfBirth ? new Date(newUser.dateOfBirth).toISOString().split('T')[0] : undefined,
            emergencyName: data.emergencyContact,
          });

          newCustomers++;
        }
      } catch (rowErr: any) {
        failedRecords++;
        failedRows.push({
          rowNumber: row.rowNumber,
          data: row.data,
          errors: [rowErr.message],
        });
      }
    }

    // Update import history
    const finalStatus =
      failedRecords === 0
        ? ImportStatus.COMPLETED
        : failedRecords === rows.length
        ? ImportStatus.FAILED
        : ImportStatus.PARTIAL;

    importRecord.status = finalStatus;
    importRecord.newCustomers = newCustomers;
    importRecord.updatedCustomers = updatedCustomers;
    importRecord.skippedCustomers = skippedCustomers;
    importRecord.failedRecords = failedRecords;
    importRecord.failedRows = failedRows;
    await importRecord.save();

    res.status(200).json({
      success: true,
      message: `Import completed: ${newCustomers} new, ${updatedCustomers} updated, ${skippedCustomers} skipped, ${failedRecords} failed`,
      importId: importRecord._id,
      newCustomers,
      updatedCustomers,
      skippedCustomers,
      failedRecords,
      failedRows,
      successfulCustomers,
      status: finalStatus,
    });
  } catch (error: any) {
    console.error('Import execute error:', error);
    res.status(500).json({ success: false, message: 'Server error during import', error: error.message });
  }
};

// ─── GET /api/import/history ─────────────────────────────────────────────────
export const getImportHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    if (!gymId) {
      res.status(403).json({ success: false, message: 'No gym associated with this account' });
      return;
    }

    const history = await ImportHistory.find({ gymId })
      .populate('importedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/import/history/:id ────────────────────────────────────────────
export const getImportHistoryById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    const { id } = req.params;

    const record = await ImportHistory.findById(id).populate('importedBy', 'firstName lastName email');
    if (!record) {
      res.status(404).json({ success: false, message: 'Import record not found' });
      return;
    }

    // Security: ensure this record belongs to the caller's gym
    if (record.gymId.toString() !== gymId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    res.status(200).json({ success: true, record });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
