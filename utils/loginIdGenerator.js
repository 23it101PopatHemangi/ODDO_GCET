const Employee = require('../models/Employee');

/**
 * Generate Login ID in format: [CompanyPrefix][First2LettersFirstName][First2LettersLastName][Year][SerialNumber]
 * Example: OIJODO20220001
 * OI = Odoo India (Company Prefix)
 * JODO = First 2 letters of first name (JO) + first 2 letters of last name (DO)
 * 2022 = Year of joining
 * 0001 = Serial number for that year
 */
const generateLoginId = async (firstName, lastName, companyName, hireDate) => {
  // Get company prefix (first 2 letters, uppercase)
  const companyPrefix = companyName
    ? companyName.substring(0, 2).toUpperCase().replace(/\s/g, '')
    : 'CO'; // Default if no company name

  // Get first 2 letters of first name and last name
  const firstNamePrefix = firstName.substring(0, 2).toUpperCase();
  const lastNamePrefix = lastName.substring(0, 2).toUpperCase();
  const namePrefix = firstNamePrefix + lastNamePrefix;

  // Get year of joining
  const year = new Date(hireDate).getFullYear();

  // Find the last serial number for this year and company
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59);

  const lastEmployee = await Employee.findOne({
    hireDate: { $gte: yearStart, $lte: yearEnd },
    companyName: companyName,
    loginId: new RegExp(`^${companyPrefix}${namePrefix}${year}`)
  }).sort({ loginId: -1 });

  let serialNumber = 1;
  if (lastEmployee && lastEmployee.loginId) {
    const lastSerial = parseInt(lastEmployee.loginId.slice(-4));
    serialNumber = lastSerial + 1;
  }

  // Format serial number with leading zeros (4 digits)
  const serialStr = String(serialNumber).padStart(4, '0');

  // Generate login ID
  const loginId = `${companyPrefix}${namePrefix}${year}${serialStr}`;

  return loginId;
};

module.exports = { generateLoginId };

