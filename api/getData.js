export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.sheety.co/3f8ed38ec6cb4d5131024c60be0f9f80/antibioticDeEscalationAuditTrail/sheet1');
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
