import { parentPort, workerData } from 'node:worker_threads';
import { openDatabase } from '../src/db.ts';
import { MindHub } from '../src/domain.ts';
const db=openDatabase(workerData.path);
parentPort!.postMessage('ready');
parentPort!.once('message',()=>{
  try {new MindHub(db).saveAppointment('a',{patient_id:workerData.patient,starts_at:'2099-01-05T09:00'});parentPort!.postMessage('created');}
  catch(error) {parentPort!.postMessage(error instanceof Error ? error.message : String(error));}
  finally {db.close();}
});
