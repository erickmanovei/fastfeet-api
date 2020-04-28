import { Op } from 'sequelize';
import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import File from '../models/File';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import DeliveryStoreMail from '../jobs/DeliveryStoreMail';
import Queue from '../../lib/Queue';
import DeliveryProblem from '../models/DeliveryProblem';

class DeliveryController {
  async index(req, res) {
    let where = null;
    let offset = null;
    let limit = null;
    const { q, page, perPage } = req.query;
    if (q) {
      where = {
        product: { [Op.iLike]: `%${q}%` },
      };
    }
    if (page && perPage) {
      offset = (page - 1) * perPage;
      limit = perPage;
    }

    const delivery = await Delivery.findAll({
      where,
      offset,
      limit,
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
          attributes: ['name'],
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

  async show(req, res) {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id, {
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name'],
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
      ],
    });
    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists.' });
    }
    return res.json(delivery);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    try {
      const newDelivery = req.body;

      const deliveryStored = await Delivery.create(newDelivery);

      const delivery = await Delivery.findByPk(deliveryStored.id, {
        include: [
          {
            model: Recipient,
            as: 'recipient',
            attributes: ['name'],
          },
          {
            model: Deliveryman,
            as: 'deliveryman',
            attributes: ['name', 'email'],
          },
          {
            model: File,
            as: 'signature',
            attributes: ['name', 'path', 'url'],
          },
        ],
      });
      await Queue.add(DeliveryStoreMail.key, {
        delivery,
      });
      return res.json(delivery);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.integer().required(),
      deliveryman_id: Yup.integer().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;

    const delivery = await Delivery.findByPk(id);
    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists.' });
    }

    try {
      const deliveryUpdated = await delivery.update(req.body);

      return res.json(deliveryUpdated);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);
    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists.' });
    }
    try {
      delivery.destroy({
        where: { id },
      });
      return res.json();
    } catch (err) {
      return res.json({ error: err.message });
    }
  }
}

export default new DeliveryController();
