export interface TransferModel {
  id: number;
  date: string | null;
  status: string;
  createdBy: string;
  creatorPosition: string;
  creatorCampus: string;
  verifiedBy: string;
  verifierPosition: string;
  transferCampus: string;
  outputId: number | null;
  outputCampus: string;
  department: string;
  outputType: string;
  outputDate: string | null;
  modifiedDate: string | null;
  observations: string;
  total: number | null;
}
