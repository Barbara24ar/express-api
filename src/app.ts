import express, { Request, Response } from 'express';
import morgan from 'morgan';
import { StatusCode } from './types';
import { v4 as uuid } from 'uuid';
import Joi from 'joi';

interface User {
    name: string;
    email: string;
    password: string;
    active: boolean;
    registrerNumber: number;
}

const userSchema = Joi.object<User>({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    active: Joi.boolean().optional(),
    registrerNumber: Joi.number().optional(),
})

function validateRequest(data: User) {
return userSchema.validate(data, { abortEarly: false });
}

function validateUserRequest(data: User) {
     const { error } = validateRequest(data);
     if (error) {
        return {
            error: error.details.map((error) => error.message).join(', ') //si encuentra un error en la validaccion del esquema retorna un objeto. y este error contiene la lista de errores que hice en la linea 24. cada error q obtiene va a estar en el mismo string lo va a separar por punto y espacio join(', ')
        }
     }
     return data;
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.get('/', (req: Request, res: Response) => {
    // res.send('Hello World!');
    res.status(StatusCode.OK).json({
        version: '1.0.0',
        message: 'welcome',
    })
});

app.post('/user', (req: Request, res: Response) => {
    //const  name = req.body.name;
    //const  email = req.body.email;
    //const  password = req.body.password;
    const { name, email, password, active, registrerNumber } = req.body as User;
    const userOrError = validateUserRequest({ name, email, password, active, registrerNumber });
    
    if ('error' in userOrError) {
        res.status(StatusCode.BAD_REQUEST).json({
            error: userOrError.error
        });
        return;
    }

    const id = uuid();
    res.status(StatusCode.CREATED).json({
        id,
        ...req.body, //los ... va a copiar todo lo que este en el objeto de body
    });

});

export default app;