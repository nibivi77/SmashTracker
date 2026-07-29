// Gates the "Delete Record" (RecordCard) and "Clear All Records" (NewRecord)
// buttons. There's no in-app toggle for this on purpose — it's a manual,
// hand-edit-and-rebuild switch for local testing, kept off in the deployed
// app since deleting now also propagates to everyone's synced records.
export const ENABLE_RECORD_DELETION_ACTIONS = false;
