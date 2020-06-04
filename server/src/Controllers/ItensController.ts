import { Request, Response } from 'express'
import knex from '../Database/connection';

class ItensController {
    async index(request: Request, response: Response) {
        const itens = await knex('itens').select('*');

        const serializedItens = itens.map(item => {
            return {
                id: item.id,
                title: item.title,
                image_url: `http://localhost:3333/Uploads/${item.image}`
            }
        })

        return response.json(serializedItens);
    }
}

export default ItensController;