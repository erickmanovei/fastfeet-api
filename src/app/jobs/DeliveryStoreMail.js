import Mail from '../../lib/Mail';

class DeliveryStoreMail {
  get key() {
    return 'DeliveryStoreMail';
  }

  async handle({ data }) {
    const { delivery } = data;
    console.log('a fila executou');
    await Mail.sendMail({
      to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
      subject: 'Nova Encomenda para Entrega',
      template: 'deliverystore',
      context: {
        deliveryman: delivery.deliveryman.name,
        recipient: delivery.recipient.name,
        product: delivery.product,
      },
    });
  }
}

export default new DeliveryStoreMail();
