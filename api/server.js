const express = require("express");
const jsonServer = require("json-server");
const cors = require("cors");
const app = express();
const port = 3000;

const jsonServerMiddleware = jsonServer.router("db.json");

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello, World!!!");
});

app.post
("/users", (req, res) => {
    const { email, username, password, address, cpf, hydrometer, isAdmin,  } = req.body;

    // Verifique se o usuário já existe no banco de dados
    const existingUser = jsonServerMiddleware.db
        .get("users")
        .find({ username })
        .value();

    if (existingUser) {
        return res
            .status(400)
            .json({ success: false, message: "Usuário já existe" });
    }

    // Obtenha o último ID de usuário no banco de dados
    const lastUser = jsonServerMiddleware.db
        .get("users")
        .orderBy("id", "desc")
        .first()
        .value();

    // Calcule o próximo ID disponível
    const nextId = lastUser ? 
lastUser.id
 + 1 : 1;

    // Adicione o novo usuário com o próximo ID
    jsonServerMiddleware.db
        .get("users")
        .push({ id: nextId, email, username, password, address, cpf, hydrometer, paid: false, isAdmin })
        .write();

    res.json({ success: true, message: "Usuário adicionado com sucesso" });
});

app.patch("/users/:id/pay", (req, res) => {
    const userId = parseInt(
req.params.id
);
    const user = jsonServerMiddleware.db
        .get("users")
        .find({ id: userId })
        .value();

    if (!user) {
        return res
            .status(404)
            .json({ success: false, message: "Usuário não encontrado" });
    }

    // Atualize a chave 'paid' para true
    jsonServerMiddleware.db
        .get("users")
        .find({ id: userId })
        .assign({ paid: true })
        .write();

    res.json({
        success: true,
        message: "Status de pagamento atualizado para true",
    });
});

app.post
("/users/login", (req, res) => {
    const { username, password } = req.body;

    const users = jsonServerMiddleware.db.get("users").value();
    const user = users.find(
        (u) => u.username === username && u.password === password
    );

    if (user) {
        res.json({
            success: true,
            message: "Login bem-sucedido",
            userInfo: {
                id: 
user.id
,
                email: 
user.email
,
                username: user.username,
                address: user.address,
                CPF: user.CPF,
                hydrometer: user.hydrometer,
                paid: user.paid,
                isAdmin: user.isAdmin,
            },
        });
    } else {
        res.status(401).json({
            success: false,
            message: "Credenciais inválidas",
        });
    }
});

// Use o JSON Server apenas para as rotas padrão
app.use(jsonServerMiddleware);

app.listen(port, () => {
    console.log(`Servidor rodando em 
http://localhost/
:${port}`);
}); 
