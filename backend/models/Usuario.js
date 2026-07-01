import db from '../config/db.js';

class Usuario {
  criar({ nome, email, senha_hash, codigo_verificacao, codigo_expiracao }) {
    const result = db.run(
      `INSERT INTO usuarios (nome, email, senha_hash, codigo_verificacao, codigo_expiracao)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, email, senha_hash, codigo_verificacao, codigo_expiracao]
    );
    return result.insertId;
  }

  buscarPorEmail(email) {
    return db.get(`SELECT * FROM usuarios WHERE email = ?`, [email]);
  }

  buscarPorId(id) {
    return db.get(
      `SELECT id, nome, email, verificado, token_version FROM usuarios WHERE id = ?`,
      [id]
    );
  }

  verificarEmail(email, codigo) {
    const result = db.run(
      `UPDATE usuarios SET verificado = 1, codigo_verificacao = NULL, codigo_expiracao = NULL
       WHERE email = ? AND codigo_verificacao = ?
       AND (codigo_expiracao IS NULL OR codigo_expiracao > datetime('now'))`,
      [email, codigo]
    );
    if (result.affectedRows === 0) {
      db.run(
        `UPDATE usuarios SET codigo_verificacao = NULL, codigo_expiracao = NULL WHERE email = ?`,
        [email]
      );
    }
    return result.affectedRows > 0;
  }

  salvarCodigo(email, codigo, expiracao) {
    db.run(
      `UPDATE usuarios SET codigo_verificacao = ?, codigo_expiracao = ? WHERE email = ?`,
      [codigo, expiracao, email]
    );
  }

  incrementarTokenVersao(id) {
    const result = db.run(
      `UPDATE usuarios SET token_version = token_version + 1 WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default new Usuario();
