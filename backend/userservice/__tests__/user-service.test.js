import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../user-model.js";

let mongoServer;
let app;

const testUser = {
  username: "simpleuser",
  name: "Simple",
  surname: "User",
  email: "simple@test.com",
  password: "SimplePass123",
  confirmPassword: "SimplePass123"
};

const testUser2 = {
  username: "simpleuser2",
  name: "Simple2",
  surname: "User2",
  email: "simple2@test.com",
  password: "SimplePass456",
  confirmPassword: "SimplePass456"
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  const { default: userService } = await import("../user-service.js");
  app = userService;
});

afterAll(async () => {
  app.close();
  await mongoServer.stop();
});

describe("User Service - Integration tests", () => {
  
  describe("Caso de Uso 1.1: Registro de usuario", () => {
    it("Registrar usuario correcto - debería registrar usuario con status 201 y retornar token y roleToken", async () => {
      const response = await request(app)
        .post("/adduser")
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("username", testUser.username);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("roleToken");
    });

    it("Contraseña débil - debería devolver status 400 indicando contraseña débil", async () => {
      const weakUser = {
        username: "weakuser",
        name: "Weak",
        surname: "User",
        email: "weak@test.com",
        password: "weak",
        confirmPassword: "weak"
      };

      const response = await request(app)
        .post("/adduser")
        .send(weakUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("La contraseña debe tener");
    });

    it("Campos requeridos faltantes - debería devolver status 400 indicando los campos faltantes", async () => {
      const invalidUser = {
        username: "nopassuser"
      };

      const response = await request(app)
        .post("/adduser")
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Missing required field");
    });

    it("Usuario o email duplicados - debería devolver status 400 indicando campo duplicado", async () => {
      const response = await request(app)
        .post("/adduser")
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("El nombre de usuario ya existe");
    });

    it("Las contraseñas no coinciden - debería devolver status 400 indicando que las contraseñas no coinciden", async () => {
      const userWithMismatchedPasswords = {
        username: "mismatchuser",
        name: "Mismatch",
        surname: "User",
        email: "mismatch@test.com",
        password: "Password123",
        confirmPassword: "DifferentPassword123"
      };

      const response = await request(app)
        .post("/adduser")
        .send(userWithMismatchedPasswords);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Las contraseñas no coinciden");
    });
  });

  describe("Caso de Uso 1.2: Autenticación de usuario", () => {
    it("Autenticación correcta - debería devolver status 200 con token, username y roleToken", async () => {
      const loginData = {
        username: testUser.username,
        password: testUser.password
      };

      const response = await request(app)
        .post("/login")
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("roleToken");
      expect(response.body).toHaveProperty("username", testUser.username);
    });

    it("Credenciales incorrectas - debería devolver status 401 indicando credenciales incorrectas", async () => {
      const loginData = {
        username: testUser.username,
        password: "wrongpassword"
      };

      const response = await request(app)
        .post("/login")
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Credenciales inválidas");
    });
  });

  describe("Caso de Uso 1.3: Consulta de información de usuario", () => {
    it("Buscar usuario existente - debería devolver status 200 con datos del usuario sin contraseña", async () => {
      const response = await request(app)
        .get("/users/search")
        .query({ username: testUser.username });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("username", testUser.username);
      expect(response.body).toHaveProperty("email", testUser.email);
      expect(response.body).not.toHaveProperty("password");
    });

    it("Usuario no encontrado - debería devolver status 404 indicando que el usuario no se ha encontrado", async () => {
      const response = await request(app)
        .get("/users/search")
        .query({ username: "nonexistentuser" });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Usuario no encontrado");
    });

    it("No se envía username o userId - debería devolver status 400 indicando que se debe enviar uno de los dos", async () => {
      const response = await request(app)
        .get("/users/search");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Se requiere nombre de usuario o userId");
    });
  });

  describe("Caso de Uso 1.4: Listado de usuarios", () => {
    beforeAll(async () => {
      await request(app).post("/adduser").send(testUser2);
    });

    it("Obtener todos los usuarios - debería devolver status 200 con datos de todos los usuarios sin contraseña", async () => {
      const response = await request(app).get("/users");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Verificar que no se incluyen contraseñas
      response.body.forEach(user => {
        expect(user).not.toHaveProperty("password");
      });
    });
  });

  describe("Caso de Uso 1.5: Verificación de token", () => {
    let validToken;
    let adminToken;

    beforeAll(async () => {
      // Obtener token válido del login
      const loginResponse = await request(app)
        .post("/login")
        .send({
          username: testUser.username,
          password: testUser.password
        });
      validToken = loginResponse.body.token;

      // Crear usuario admin y obtener su token
      const adminUser = {
        username: "adminuser",
        name: "Admin",
        surname: "User",
        email: "admin@test.com",
        password: "AdminPass123",
        confirmPassword: "AdminPass123",
        role: "admin"
      };

      await request(app).post("/adduser").send(adminUser);

      const adminLoginResponse = await request(app)
        .post("/login")
        .send({
          username: adminUser.username,
          password: adminUser.password
        });
      adminToken = adminLoginResponse.body.roleToken;
    });

    it("Token válido de administrador - debería devolver status 200 con rol = admin", async () => {
      const response = await request(app)
        .post("/verifyToken")
        .send({ token: adminToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("role", "admin");
    });

    it("Token inválido - debería devolver status 401 indicando que el token es inválido o ha expirado", async () => {
      const response = await request(app)
        .post("/verifyToken")
        .send({ token: "invalid-token" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Token inválido o expirado");
    });

    it("Token válido de usuario - debería devolver status 403 indicando que el usuario no está autorizado", async () => {
      const response = await request(app)
        .post("/verifyToken")
        .send({ token: validToken });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("error", "Prohibido");
    });

    it("Sin token - debería devolver status 400 indicando que no se ha enviado token", async () => {
      const response = await request(app)
        .post("/verifyToken")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Se requiere un token");
    });
  });

  describe("Caso de Uso 1.6: Edición de perfil", () => {
    let userId;

    beforeAll(async () => {
      // Obtener el ID del usuario para las pruebas de edición
      const user = await User.findOne({ username: testUser.username });
      userId = user._id.toString();
    });

    it("Actualizar datos básicos - debería devolver status 200 y mensaje de éxito", async () => {
      const updateData = {
        name: "UpdatedName",
        surname: "UpdatedSurname",
        email: "updated@test.com"
      };

      const response = await request(app)
        .put(`/edit-user/${userId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Perfil actualizado exitosamente");
      expect(response.body.user.name).toBe("UpdatedName");
      expect(response.body.user.surname).toBe("UpdatedSurname");
    });

    it("Actualizar contraseña correcta - debería devolver status 200 y mensaje de éxito", async () => {
      const updateData = {
        password: "NewPassword123",
        currentPassword: testUser.password
      };

      const response = await request(app)
        .put(`/edit-user/${userId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Perfil y contraseña actualizados exitosamente");
    });

    it("Actualizar contraseña sin indicar contraseña actual - debería devolver status 400 indicando que se debe enviar la contraseña actual", async () => {
      const updateData = {
        password: "AnotherPassword123"
      };

      const response = await request(app)
        .put(`/edit-user/${userId}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Se requiere la contraseña actual");
    });

    it("Contraseña actual incorrecta - debería devolver status 400 indicando que la contraseña actual es incorrecta", async () => {
      const updateData = {
        password: "NewPassword456",
        currentPassword: "wrongcurrentpassword"
      };

      const response = await request(app)
        .put(`/edit-user/${userId}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("La contraseña actual es incorrecta");
    });

    it("Email en formato inválido - debería devolver status 400 indicando que el formato del email es incorrecto", async () => {
      const updateData = {
        email: "invalid-email-format"
      };

      const response = await request(app)
        .put(`/edit-user/${userId}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Formato de email inválido");
    });

    it("Nombre de usuario o email existentes - debería devolver status 400 indicando que el username o email ya están en uso", async () => {
      const updateData = {
        username: testUser2.username // Intentar usar el username del segundo usuario
      };

      const response = await request(app)
        .put(`/edit-user/${userId}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/ya existe|ya está en uso/i);
    });

    it("Editar usuario inexistente - debería devolver status 404 indicando que el usuario no existe", async () => {
      const fakeUserId = "507f1f77bcf86cd799439011";
      const updateData = {
        name: "NewName"
      };

      const response = await request(app)
        .put(`/edit-user/${fakeUserId}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain("Usuario no encontrado");
    });
  });

  describe("Validaciones con base de datos", () => {
    it("debería encontrar usuario en la base de datos", async () => {
      const user = await User.findOne({ username: testUser.username });

      expect(user).toBeDefined();
      expect(user.username).toBe(testUser.username);
      // El email puede haber sido actualizado en tests anteriores, así que verificamos que existe
      expect(user.email).toBeDefined();
      expect(typeof user.email).toBe('string');
    });

    it("debería retornar null para usuario inexistente", async () => {
      const user = await User.findOne({ username: "nonexistentuser999" });

      expect(user).toBeNull();
    });

    it("debería tener contraseña hasheada", async () => {
      const user = await User.findOne({ username: testUser.username });

      expect(user.password).not.toBe(testUser.password);
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    it("debería tener campos de fecha de creación", async () => {
      const user = await User.findOne({ username: testUser.username });

      expect(user).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
    });
  });
});