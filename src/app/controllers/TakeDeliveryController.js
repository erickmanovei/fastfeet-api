import { startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Delivery from '../models/Delivery';

class TakeDeliveryController {
  async update(req, res) {
    const { id } = req.params;

    const delivery = await Delivery.findOne({
      where: {
        id,
        start_date: null,
        canceled_at: null,
      },
    });
    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists.' });
    }

    const { deliveryman_id } = delivery;

    const deliverToday = await Delivery.findAll({
      where: {
        deliveryman_id,
        canceled_at: null,
        start_date: {
          [Op.between]: [startOfDay(new Date()), endOfDay(new Date())],
        },
      },
    });

    if (deliverToday.length >= 5) {
      return res.status(401).json({
        error: 'It is not allowed to withdraw more than 5 orders per day',
      });
    }

    try {
      const deliveryUpdated = await delivery.update({
        start_date: new Date(),
      });

      return res.json(deliveryUpdated);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export default new TakeDeliveryController();
