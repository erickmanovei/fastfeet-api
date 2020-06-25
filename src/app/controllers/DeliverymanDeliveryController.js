import { Op } from 'sequelize';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import File from '../models/File';
import Deliveryman from '../models/Deliveryman';
import DeliveryProblem from '../models/DeliveryProblem';

class DeliverymanDeliveryController {
  async index(req, res) {
    const { id } = req.params;
    const delivered = JSON.parse(req.query.delivered);

    let where = null;

    if (delivered) {
      where = {
        deliveryman_id: id,
        end_date: { [Op.not]: null },
        canceled_at: null,
      };
    } else {
      where = {
        deliveryman_id: id,
        end_date: null,
        canceled_at: null,
      };
    }

    let offset = null;
    let limit = null;
    const { page, perPage } = req.query;
    if (page && perPage) {
      offset = (page - 1) * perPage;
      limit = perPage;
    }

    const delivery = await Delivery.findAll({
      offset,
      limit,
      where,
      attributes: [
        'id',
        'recipient_id',
        'deliveryman_id',
        'signature_id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
      ],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'city', 'state'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
        {
          model: DeliveryProblem,
          as: 'problems',
          attributes: ['description'],
        },
      ],
    });
    return res.json(delivery);
  }
}
export default new DeliverymanDeliveryController();
