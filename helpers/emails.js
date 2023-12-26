import nodemailer from 'nodemailer';

export const emailRegistro = async (datos) => {//datos va a ser un objeto
    //console.log("datos ", datos);
    const {email, nombre, token} = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    //Información del email
    const info = await transport.sendMail({
        from: "'UpTask - Administrador de proyectos' <cuentas@uptasks.com> ",
        to: email,
        subject: "Uptasks - Comprueba tu cuenta",
        text: "Comprueba tu cuenta de UpTask",
        html: `
            <p>Hola: ${nombre}</p>
            <p>Tu cuenta está casi lista, solo debes comprobarla en el siguiente enlace: </p>
            <a href="${process.env.FRONTED_URL}/confirmar/${token}">Comprobar Cuenta</a>
            <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
        `
    })
}


export const emailRecuperarPassword = async (datos)=>{
    const {email, nombre, token} = datos;
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    //TODO: Mover a variables de entornos
    const info = await transport.sendMail({
        from: "'UpTask - Administrador de proyectos' <cuentas@uptasks.com> ",
        to: email,
        subject: "Uptasks - Reestablece tu password",
        text: "Reestablece tu password",
        html: `
            <p>Hola: ${nombre}</p>
            <p>Haz click en el siguiente enlace para restablecer tu password</p>
            <a href="${process.env.FRONTED_URL}/olvide-password/${token}">Reestablecer password</a>
            <p>Si tu no solicitaste este email, puedes ignorar el mensaje</p>
        `
    })

}