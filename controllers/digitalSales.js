import digitalSales from '../models/digitalSales.js';
import UsersModal from '../models/users.js';

export const createDigitalSales = async (req, res) => {
  const sales = req.body;

  const user = await UsersModal.findOne({ _id: req.userId });

  const newDigitalSales = new digitalSales({ ...sales, store: user?.store ? user.store : 'undefined' });
  try {
    await newDigitalSales.save();

    res.status(200).json(newDigitalSales);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
