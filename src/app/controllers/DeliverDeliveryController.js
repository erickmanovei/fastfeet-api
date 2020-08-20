import { Op } from 'sequelize';
import Delivery from '../models/Delivery';
import File from '../models/File';

class DeliverDeliveryController {
  async update(req, res) {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({
        error: 'Necessário enviar a foto da assinatura.',
      });
    }

    const delivery = await Delivery.findOne({
      where: {
        id,
        start_date: { [Op.not]: null },
        canceled_at: null,
      },
    });
    if (!delivery) {
      return res.status(400).json({
        error: 'Delivery does not exist or has not yet been withdrawn.',
      });
    }

    let signature_id = null;

    if (req.file) {
      const { originalname: name, filename: path } = req.file;
      const file = await File.create({
        name,
        path,
      });
      signature_id = file.id;
    }

    try {
      const deliveryUpdated = await delivery.update({
        end_date: new Date(),
        signature_id,
      });

      return res.json(deliveryUpdated);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export default new DeliverDeliveryController();
