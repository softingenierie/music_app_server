import { Request, Response } from "express";
import User from "../models/user.model";
import Compte from "../models/compte.model";
import Activites from "../models/competance.model";
import { Types } from "mongoose";
import bcrypt from 'bcrypt'
import upload from "../middlewares/multer.middleware";
import multer from "multer";
import Artiste from "../models/artiste.model";

class AuthController {
    index(req: Request, res: Response) {
        const filter = ['activite', 'genre_musical', '-_id', 'instruments', 'fichiers', 'categorie']
        Compte.findOne({ owner: '63cad5702df2015e499279eb' })
            .populate('owner', '-_id -__v')
            .select("-_id -__v")
            .exec((err, doc) => {
                if (err) console.log(err)
                // res.status(200).send(doc)
                const docA = doc
                Activites.findOne({ artiste: '63cad5702df2015e499279eb' })
                    .select('-__v -_id -artiste')
                    .exec((err, doc) => {
                        const infos = { "information_generales": docA, "Profile": doc }
                        res.status(200).send(infos)
                    })
            })
    }
    uploadTest(req: Request, res: Response) {
        const ut = upload.single("audio")
        ut(req, res, (err: unknown) => {
            if (err instanceof multer.MulterError && err.code == 'LIMIT_FILE_SIZE') {
                return res.status(400).send({ message: 'Seul les fichiers de moins de 5MB sont autorisés' })
            } else if (err instanceof Error) {
                return res.status(400).send({ message: err.message })
            }
            console.log(req.file)
            res.status(200).send("ok")
        })

    }
    async signIn(req: Request, res: Response) {
        const { body } = req
        const username = body.username
        const password = body.password
        const user = await Compte.findOne({ username: username })
        if (user) {
            bcrypt.compare(password, user.password, (err, isValid) => {
                if (isValid) res.status(200).send(user)
                else res.status(201).send('Mot de passe incorrect')
            })
        } else res.status(404).send('Aucun utilisateur trouvé')

    }
    async GpsignUp(req: Request, res: Response) {
        const { body } = req
        const salt = await bcrypt.genSalt(10)
        const CryptedPassword = await bcrypt.hash(body.password, salt)
        const user = new User({
            _id: new Types.ObjectId,
            nom: body.nom,
            prenoms: body.prenoms,
            contact: body.contact,
            coordonnees: body.coordonnees,
            email: body.email
        })
        user.save(async (err, usr) => {
            if (err) {
                console.log(err);
            }
            const compte = new Compte({
                _id: new Types.ObjectId,
                username: body.username,
                password: CryptedPassword,
                owner: usr._id
            })
            if (body.activite) {
                const activites = new Activites({
                    _id: new Types.ObjectId,
                    artiste: usr._id,
                    activite: body.activite,
                })
                await activites.save()
            }
            await compte.save()
            res.status(200).send('OK')
        })

    }
    async proSingup(req: Request, res: Response) {
        const { body } = req
        const salt = await bcrypt.genSalt(10)
        const CryptedPassword = await bcrypt.hash(body.password, salt)
        const artiste = new Artiste({
            _id: new Types.ObjectId,
            nom: body.nom,
            prenoms: body.prenoms,
            contact: body.contact,
            email: body.email,
            pays: body.pays,
            ville: body.ville,
            metiers: body.metiers,
            style_musical: body.style_musical,
            instruments: body.instruments,
        })
        artiste.save(async (err, usr) => {
            if (err) console.log(err)
            const compte = new Compte({
                _id: new Types.ObjectId,
                username: body.username,
                password: CryptedPassword,
                type_compte: 'Professionnel',
                owner: usr._id
            })
            await compte.save().then(()=> res.status(200).send({ message: 'ok' }))
        })
    }
    changePassword(req: Request, res: Response) {

    }
    resetPassword(req: Request, res: Response) {

    }
}


export default new AuthController()