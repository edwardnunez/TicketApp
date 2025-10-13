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
  
  describe("Caso de Uso 1: Registro de usuario", () => {
    it("debería registrar un nuevo usuario correctamente", async () => {
      const response = await request(app)
        .post("/adduser")
        .send(testUser);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("username", testUser.username);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("roleToken");
    });

    it("debería rechazar registro con contraseña débil", async () => {
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
      expect(response.body.error).toContain("Password must be");
    });

    it("debería rechazar registro sin campos requeridos", async () => {
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

    it("debería rechazar registro de usuario duplicado", async () => {
      const response = await request(app)
        .post("/adduser")
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Username already exists");
    });

    it("debería rechazar contraseñas que no coinciden", async () => {
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
      expect(response.body.error).toContain("Passwords do not match");
    });
  });

  describe("Caso de Uso 2: Autenticación de usuario", () => {
    it("debería autenticar usuario con credenciales correctas", async () => {
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

    it("debería rechazar autenticación con credenciales incorrectas", async () => {
      const loginData = {
        username: testUser.username,
        password: "wrongpassword"
      };

      const response = await request(app)
        .post("/login")
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Invalid credentials");
    });

    it("debería rechazar autenticación de usuario inexistente", async () => {
      const loginData = {
        username: "nonexistentuser",
        password: "somepassword"
      };

      const response = await request(app)
        .post("/login")
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Invalid credentials");
    });
  });

  describe("Caso de Uso 3: Consulta de información de usuario", () => {
    it("debería obtener información de usuario existente por username", async () => {
      const response = await request(app)
        .get("/users/search")
        .query({ username: testUser.username });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("username", testUser.username);
      expect(response.body).toHaveProperty("email", testUser.email);
      expect(response.body).not.toHaveProperty("password");
    });

    it("debería retornar 404 para usuario inexistente", async () => {
      const response = await request(app)
        .get("/users/search")
        .query({ username: "nonexistentuser" });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "User not found");
    });

    it("debería retornar error cuando no se proporciona username o userId", async () => {
      const response = await request(app)
        .get("/users/search");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Username or userId is required");
    });
  });

  describe("Caso de Uso 4: Listado de usuarios", () => {
    beforeAll(async () => {
      await request(app).post("/adduser").send(testUser2);
    });

    it("debería obtener todos los usuarios", async () => {
      const response = await request(app).get("/users");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Verificar que no se incluyen contraseñas
      response.body.forEach(user => {
        expect(user).not.toHaveProperty("password");
      });
    });

    it("debería buscar usuarios por nombre", async () => {
      const response = await request(app)
        .get("/users/search")
        .query({ username: "simple" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("username");
      expect(response.body.username).toContain("simple");
    });

    it("debería retornar error al buscar usuario inexistente", async () => {
      const response = await request(app)
        .get("/users/search")
        .query({ username: "nonexistentxyz123" });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "User not found");
    });
  });

  describe("Caso de Uso 5: Verificación de token", () => {
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

    it("debería verificar token válido de admin", async () => {
      const response = await request(app)
        .post("/verifyToken")
        .send({ token: adminToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("role", "admin");
    });

    it("debería rechazar token inválido", async () => {
      const response = await request(app)
        .post("/verifyToken")
        .send({ token: "invalid-token" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Invalid or expired token");
    });

    it("debería rechazar token de usuario no admin", async () => {
      const response = await request(app)
        .post("/verifyToken")
        .send({ token: validToken });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("error", "Forbidden");
    });

    it("debería rechazar request sin token", async () => {
      const response = await request(app)
        .post("/verifyToken")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Token is required");
    });
  });

  describe("Caso de Uso 6: Edición de perfil", () => {
    let userId;

    beforeAll(async () => {
      // Obtener el ID del usuario para las pruebas de edición
      const user = await User.findOne({ username: testUser.username });
      userId = user._id.toString();
    });

    it("debería actualizar información básica del usuario", async () => {
      const updateData = {
        name: "UpdatedName",
        surname: "UpdatedSurname",
        email: "updated@test.com"
      };

      const response = await request(app)
        .put(`/edit-user/${userId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Profile updated successfully");
      expect(response.body.user.name).toBe("UpdatedName");
      expect(response.body.user.surname).toBe("UpdatedSurname");
    });

    it("debería actualizar contraseña con contraseña actual correcta", async () => {
      const updateData = {
        password: "NewPassword123",
        currentPassword: testUser.password
      };

      const response = await request(app)
        .put(`/edit-user/${userId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Profile and password updated successfully");
    });

    it("debería rechazar actualización de contraseña sin contraseña actual", async () => {
      const updateData = {
        password: "AnotherPassword123"
      };

      const response = await request(app)
        .put(`/edit-user/${userId}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Current password is required");
    });

    it("debería rechazar actualización de contraseña con contraseña actual incorrecta", async () => {
      const updateData = {
        password: "NewPassword456",
        currentPassword: "wrongcurrentpassword"
      };

      const response = await request(app)
        .put(`/edit-user/${userId}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Current password is incorrect");
    });

    it("debería rechazar actualización de email con formato inválido", async () => {
      const updateData = {
        email: "invalid-email-format"
      };

      const response = await request(app)
        .put(`/edit-user/${userId}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Invalid email format");
    });

    it("debería retornar 404 para usuario inexistente", async () => {
      const fakeUserId = "507f1f77bcf86cd799439011";
      const updateData = {
        name: "NewName"
      };

      const response = await request(app)
        .put(`/edit-user/${fakeUserId}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain("User not found");
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