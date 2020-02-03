import * as Yup from 'yup';
import axios from 'axios';
import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const recipients = await Recipient.findAll({ raw: true });
    return res.json(recipients);
  }

  async show(req, res) {
    const { id } = req.params;
    const recipient = await Recipient.findByPk(id);
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exists.' });
    }
    return res.json(recipient);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      address_number: Yup.string().required(),
      cep: Yup.string()
        .required()
        .min(9)
        .max(9),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    try {
      let newRecipient = req.body;
      if (!req.body.address) {
        const cepWithoutMask = req.body.cep.replace('-', '');
        const data = await axios.get(
          `https://viacep.com.br/ws/${cepWithoutMask}/json/`
        );
        newRecipient = {
          name: req.body.name,
          address: data.data.logradouro,
          address_number: req.body.address_number,
          address_complement: data.data.complemento,
          district: data.data.bairro,
          city: data.data.localidade,
          state: data.data.uf,
          cep: req.body.cep,
        };
      }

      const {
        id,
        name,
        address,
        address_number,
        address_complement,
        district,
        city,
        state,
        cep,
      } = await Recipient.create(newRecipient);

      return res.json({
        id,
        name,
        address,
        address_number,
        address_complement,
        district,
        city,
        state,
        cep,
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      address_number: Yup.string().required(),
      cep: Yup.string()
        .required()
        .min(9)
        .max(9),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exists.' });
    }

    try {
      const {
        name,
        address,
        address_number,
        address_complement,
        district,
        city,
        state,
        cep,
      } = await recipient.update(req.body);

      return res.json({
        id,
        name,
        address,
        address_number,
        address_complement,
        district,
        city,
        state,
        cep,
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    const { id } = req.params;
    const recipient = await Recipient.findByPk(id);
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exists.' });
    }
    try {
      recipient.destroy({
        where: { id },
      });
      return res.json();
    } catch (err) {
      return res.json({ error: err.message });
    }
  }
}

export default new RecipientController();
