import mongoose from 'mongoose';
import dotenv from 'dotenv';
import net from 'net';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Helper to check if a port is open
const isPortOpen = (port: number, host = '127.0.0.1', timeout = 1500): Promise<boolean> => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;

    socket.setTimeout(timeout);
    socket.on('connect', () => {
      status = true;
      socket.destroy();
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('close', () => {
      resolve(status);
    });

    socket.connect(port, host);
  });
};

// Auto-start local MongoDB if available and not currently running
const tryStartLocalMongo = async (): Promise<boolean> => {
  const userProfile = process.env.USERPROFILE || 'C:\\Users\\renug';
  const possiblePaths = [
    process.env.MONGOD_PATH,
    'C:\\Users\\renug\\mongodb_bin\\MongoDB\\Server\\8.2\\bin\\mongod.exe',
    path.join(userProfile, 'mongodb_bin', 'MongoDB', 'Server', '8.2', 'bin', 'mongod.exe'),
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
  ].filter(Boolean) as string[];

  const mongodPath = possiblePaths.find((p) => fs.existsSync(p));
  if (!mongodPath) {
    return false;
  }

  const possibleDbPaths = [
    process.env.MONGOD_DBPATH,
    'C:\\Users\\renug\\mongodb_data',
    path.join(userProfile, 'mongodb_data'),
    path.join(__dirname, '../../../mongodb_data'),
  ].filter(Boolean) as string[];

  const dbPath = possibleDbPaths[0];
  try {
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    console.log(`[Database] Auto-starting local MongoDB from: ${mongodPath}`);
    const proc = spawn(mongodPath, ['--dbpath', dbPath, '--bind_ip', '127.0.0.1', '--port', '27017'], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    proc.unref();

    // Poll until port 27017 is open (up to 10 seconds)
    const startTime = Date.now();
    while (Date.now() - startTime < 10000) {
      await new Promise((r) => setTimeout(r, 400));
      const ready = await isPortOpen(27017);
      if (ready) {
        console.log('[Database] MongoDB daemon is up and ready on port 27017.');
        return true;
      }
    }
  } catch (err: any) {
    console.error('[Database] Failed to auto-start MongoDB:', err.message);
  }

  return false;
};

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-gym';

  // Check if port 27017 is already listening
  const isOpen = await isPortOpen(27017);
  if (!isOpen) {
    console.log('[Database] MongoDB is not running on port 27017. Attempting auto-start...');
    await tryStartLocalMongo();
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`[Database] Connection Error: ${error.message}`);
    // Retry in background instead of crashing the process
    setTimeout(() => {
      console.log('[Database] Retrying MongoDB connection...');
      connectDB();
    }, 5000);
  }
};

export default connectDB;
