import express from 'express';

import PointsController from './Controllers/PointsController';
import ItensController from './Controllers/ItensController';

const routes = express.Router();
const pointsController = new PointsController();
const itensController = new ItensController()

routes.get('/itens', itensController.index);

routes.post('/points', pointsController.create);
routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);

export default routes;