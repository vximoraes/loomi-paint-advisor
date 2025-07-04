import { Request, Response } from 'express';
import UsuarioService from '../services/UsuarioService';
import { UsuarioCreateSchema, UsuarioUpdateSchema, UsuarioIdSchema } from '../utils/validators/schemas/usuarioSchema';
import { Usuario } from '../models/Usuario';

class UsuarioController {
    private usuarioService: UsuarioService;
    constructor(usuarioService: UsuarioService) {
        this.usuarioService = usuarioService;
    }

    async create(req: Request, res: Response) {
        const parsed = UsuarioCreateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.errors });
        }

        const user = await this.usuarioService.create(parsed.data);
        if ((user as any).error) {
            return res.status(400).json({ message: (user as any).error });
        }
        
        res.status(201).json(user);
    }

    async findAll(req: Request, res: Response) {
        const users = await this.usuarioService.findAll();
        res.status(200).json(users);
    }

    async findById(req: Request, res: Response) {
        const { id: requestedId } = req.params;

        const loggedInUser = (req as any).user as Usuario | undefined;
        if (!loggedInUser) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        if (loggedInUser.role !== 'ADMIN' && String(loggedInUser.id) !== requestedId) {
            return res.status(403).json({ message: 'Acesso negado. Permissão insuficiente.' });
        }

        const parsed = UsuarioIdSchema.safeParse(req.params);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.errors });
        }

        const user = await this.usuarioService.findById(parsed.data.id);
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
        res.status(200).json(user);
    }

    async update(req: Request, res: Response) {
        const { id: requestedId } = req.params;

        const loggedInUser = (req as any).user as Usuario | undefined;
        if (!loggedInUser) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        if (loggedInUser.role !== 'ADMIN' && String(loggedInUser.id) !== requestedId) {
            return res.status(403).json({ message: 'Acesso negado. Permissão insuficiente.' });
        }

        const idParsed = UsuarioIdSchema.safeParse(req.params);
        if (!idParsed.success) {
            return res.status(400).json({ errors: idParsed.error.errors });
        }

        const bodyParsed = UsuarioUpdateSchema.safeParse(req.body);
        if (!bodyParsed.success) {
            return res.status(400).json({ errors: bodyParsed.error.errors });
        }

        const user = await this.usuarioService.update(idParsed.data.id, bodyParsed.data);
        if ((user as any).error) {
            return res.status(404).json({ message: (user as any).error });
        }
        
        res.status(200).json(user);
    }

    async delete(req: Request, res: Response) {
        const parsed = UsuarioIdSchema.safeParse(req.params);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.errors });
        }

        const deleted = await this.usuarioService.delete(parsed.data.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        res.status(200).json({ message: 'Usuário deletado com sucesso' });
    }
}

export default UsuarioController;