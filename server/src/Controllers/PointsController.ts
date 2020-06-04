import { Request, Response } from 'express'
import knex from '../Database/connection';

class PointsController {
    async index(request: Request, response: Response) {
        const { city, uf, itens } = request.query;

        const parsedItens = String(itens).split(',').map(item => Number(item.trim()));

        const points = await knex('points')
            .join('points_itens', 'points.id', '=', 'points_itens.point_id')
            .whereIn('points_itens.item_id', parsedItens)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*')

        return response.json({ points })
    }
    async show(request: Request, response: Response) {
        const { id } = request.params;

        const point = await knex('points').where('id', id).first();

        if (!point) {
            return response.status(400).json({ message: 'Point not found.' });
        }

        const itens = await knex('itens')
            .join('points_itens', 'itens.id', '=', 'points_itens.item_id')
            .where('points_itens.point_id', id)
            .select('itens.title')

        return response.json({ point, itens })
    }
    async create(request: Request, response: Response) {
        const {
            name, email, whatsapp,
            latitude, longitude, city,
            uf, itens
        } = request.body;

        const trx = await knex.transaction();

        const points = {
            image: 'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=667&q=60',
            name, email, whatsapp,
            latitude, longitude, city, uf
        }

        const insertedIds = await trx('points').insert(points);

        const point_id = insertedIds[0];

        const pointItems = itens.map((item_id: number) => {
            return {
                item_id,
                point_id
            }
        });

        await trx('points_itens').insert(pointItems)

        await trx.commit();

        return response.json({ id: point_id, ...points })
    }
}

export default PointsController;