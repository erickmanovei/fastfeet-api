import { Op } from 'sequelize';
import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    let where = null;
    const { q } = req.query;
    if (q) {
      where = {
        name: { [Op.iLike]: `%${q}%` },
      };
    }

    let offset = null;
    let limit = null;
    const { page, perPage } = req.query;
    if (page && perPage) {
      offset = (page - 1) * perPage;
      limit = perPage;
    }

    const deliveryman = await Deliveryman.findAndCountAll({
      offset,
      limit,
      where,
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });
    return res.json(deliveryman);
  }

  async show(req, res) {
    const { id } = req.params;
    const deliveryman = await Deliveryman.findByPk(id, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });
    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists.' });
    }
    return res.json(deliveryman);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    try {
      const newDeliveryman = req.body;

      const { id, name, avatar_id, email } = await Deliveryman.create(
        newDeliveryman
      );

      return res.json({
        id,
        name,
        avatar_id,
        email,
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);
    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists.' });
    }

    try {
      const { name, avatar_id, email } = await deliveryman.update(req.body);

      return res.json({
        id,
        name,
        avatar_id,
        email,
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    const { id } = req.params;
    const deliveryman = await Deliveryman.findByPk(id);
    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists.' });
    }
    try {
      deliveryman.destroy({
        where: { id },
      });
      return res.json();
    } catch (err) {
      return res.json({ error: err.message });
    }
  }
}

export default new DeliverymanController();
