// export interface IContractStatus {
//   Active: 0; // Contract is active and ongoing
//   Inactive: 1; // Contract is inactive (paused or suspended)
//   Pending: 2; // Contract is pending (awaiting actions or approval)
//   Terminated: 3; // Contract is terminated (ended prematurely)
//   Expired: 4; // Contract has expired
//   Renewed: 5; // Contract has been renewed
//   Draft: 6; // Contract is in draft stage (not finalized)
//   Cancelled: 7; // Contract is cancelled by either party
// }

export const IContractStatus = [
  { value: 0, label: 'Active' },
  { value: 1, label: 'Inactive' },
  { value: 2, label: 'Pending' },
  { value: 3, label: 'Terminated' },
  { value: 4, label: 'Expired' },
  { value: 5, label: 'Renewed' },
  { value: 6, label: 'Draft' },
  { value: 7, label: 'Cancelled' },
];
