export const DEED_OCR_PROMPT = `Analyze this deed document image and extract the following information as JSON:
{
  "parcelId": "the parcel identification number",
  "grantor": "the grantor/seller name",
  "grantee": "the grantee/buyer name",
  "legalDescription": "the legal property description",
  "recordingInfo": "book/page or instrument number if visible",
  "confidence": 0.0
}
Include a "confidence" field (0.0-1.0) indicating your certainty in the extraction accuracy. Consider image clarity, completeness of visible text, and whether any fields required guessing.
Only include fields you can confidently extract. Use null for fields you cannot determine.`;

export const DATA_PLATE_OCR_PROMPT = `Analyze this manufactured home data plate image and extract the following information as JSON:
{
  "manufacturer": "manufacturer name",
  "modelNumber": "model number",
  "serialNumber": "serial number",
  "maxFloorLoad": "maximum floor load in PSF (number only)",
  "windZone": "wind zone rating (I, II, or III)",
  "thermalZone": "thermal zone",
  "roofLoad": "roof live/snow load in PSF (number only)",
  "dimensions": "width x length",
  "confidence": 0.0
}
Include a "confidence" field (0.0-1.0) indicating your certainty in the extraction accuracy. Consider image clarity, completeness of visible text, and whether any fields required guessing.
Only include fields you can confidently extract. Use null for fields you cannot determine.`;

export const NOC_CHECK_PROMPT = `Examine this Notice of Commencement document and determine:
{
  "isRecorded": true/false (does it have a recording stamp from the county clerk?),
  "recordingDate": "date of recording if visible",
  "instrumentNumber": "instrument/official records number if visible",
  "ownerName": "property owner name",
  "contractorName": "contractor name",
  "propertyAddress": "property address",
  "confidence": 0.0
}
Include a "confidence" field (0.0-1.0) indicating your certainty in the extraction accuracy. Consider image clarity, completeness of visible text, and whether any fields required guessing.
The key determination is whether this NOC has been RECORDED (stamped by the county clerk's office). An unrecorded NOC is a compliance issue.`;
