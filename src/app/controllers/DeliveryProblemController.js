import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import File from '../models/File';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import DeliveryProblem from '../models/DeliveryProblem';
import CancelDeliveryMail from '../jobs/CancelDeliveryMail';
import Queue from '../../lib/Queue';

class DeliveryProblemController {
  async index(req, res) {
    let offset = null;
    let limit = null;
    const { page, perPage } = req.query;
    if (page && perPage) {
      offset = (page - 1) * perPage;
      limit = perPage;
    }

    const deliveryProblems = await DeliveryProblem.findAndCountAll({
      offset,
      limit,
      include: [
        {
          model: Delivery,
          as: 'delivery',
          where: {
            canceled_at: null,
            end_date: null,
          },
        },
      ],
    });
    return res.json(deliveryProblems);
  }

  async show(req, res) {
    const { id } = req.params;
    const problems = await DeliveryProblem.findAll({
      where: {
        delivery_id: id,
      },
    });

    return res.json(problems);
  }

  async store(req, res) {
    const { id } = req.params;
    const delivery = Delivery.findByPk(id);

    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body)) || !delivery) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    try {
      const { description } = req.body;

      const problemStored = await DeliveryProblem.create({
        delivery_id: id,
        description,
      });

      return res.json(problemStored);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    const { id } = req.params;
    const problem = await DeliveryProblem.findByPk(id);
    if (!problem) {
      return res.status(400).json({ error: 'Problem does not exists.' });
    }
    const delivery = await Delivery.findOne({
      where: {
        id: problem.delivery_id,
        canceled_at: null,
      },
    });
    if (!delivery) {
      return res.status(400).json({ error: 'Delivery is already canceled.' });
    }

    try {
      delivery.update({
        canceled_at: new Date(),
      });
      const completeDelivery = await Delivery.findByPk(problem.delivery_id, {
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
          {
            model: DeliveryProblem,
            as: 'problems',
            attributes: ['description'],
          },
        ],
      });
      await Queue.add(CancelDeliveryMail.key, {
        delivery: completeDelivery,
        problem: problem.description,
      });
      return res.json(completeDelivery);
    } catch (err) {
      return res.json({ error: err.message });
    }
  }
}

export default new DeliveryProblemController();
