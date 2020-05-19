# Introdução

Esta é a API completa do projeto Fast Feet, que se trata de uma transportadora fictícia que contempla a área administrativa da transportadora (sistema web de acompanhamento, cadastro e edição de encomendas, entregadores, destinatários e problemas nas entregas) e a área do Entregador (sistema mobile de acompanhamento, retirada e entregas de encomendas, além de relatos de problemas).
Este projeto foi desenvolvido em Node.js, utilizando Express e faz parte do estudo do Bootcamp da Rocketseat.

## Instalação

É necessário possuir o [Node.js](https://nodejs.org/) instalado em seu computador, para ser possível rodar o projeto.

Você deverá utilizar o [GIT](https://git-scm.com/) para clonar este repositório, por meio do comando:

```bash
git clone https://github.com/erickmanovei/fastfeet-web.git
```

Utilize o gerenciador de pacotes [yarn](https://yarnpkg.com/) para realizar a instalação, rodando o seguinte comando na raiz do projeto:

```bash
yarn
```
Recomendamos a utilização do Eslint, Prettier e EditorConfig. Para tanto, os mantenha configurado no seu editor de códigos ou IDE.

Este projeto utiliza banco de dados PostGres, e utiliza o Redis para gerenciamento de fila de e-mails. É necessário já possuir esses 2 serviços em funcionamento.

Na raiz do projeto execute:

```bash
cp .env.example .env
```

Edite o arquivo .env inserindo os valores de todas as suas variáveis, pois se tratam das configurações do projeto.

Agora será necessário rodar as migrations e as seeds do projeto, executando os comandos:

```bash
yarn sequelize db:migrate
```
em seguida:
```bash
yarn sequelize db:seed:all
```

## Utilização

Para disponibilizar as APIs, você deverá executar o seguinte comando:

```bash
yarn dev
```
O serviço de envio de e-mails é executado separadamente. Desta forma, para que funcione, é necessário rodar este outro comando em outro terminal:
```bash
yarn queue
```

Você poderá utilizar o usuário que foi criado pelo seed para se autenticar na API inicialmente. Seguem suas credenciais:

E-mail: admin@fastfeet.com
Senha: 123456

## Licença
[MIT](https://choosealicense.com/licenses/mit/)
