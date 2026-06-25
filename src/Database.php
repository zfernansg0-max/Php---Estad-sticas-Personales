<?php
/**
 * Patrón SINGLETON
 * ------------------------------------------------------------
 * Garantiza que exista una única instancia de la conexión a la
 * base de datos en toda la aplicación. Sin este patrón, cada
 * archivo de api/ podría crear su propia conexión PDO, lo cual
 * desperdicia recursos. Aquí, sin importar cuántas veces se
 * llame a Database::getInstance(), siempre se devuelve la
 * misma conexión ya abierta.
 */
class Database
{
    private static ?Database $instancia = null;
    private PDO $conexion;

    // El constructor es privado: nadie puede hacer "new Database()"
    // desde fuera de la clase, solo getInstance() puede crearla.
    private function __construct()
    {
        $host    = 'localhost';
        $db      = 'panel_estadisticas';
        $user    = 'root';
        $pass    = '';
        $charset = 'utf8mb4';

        $dsn = "mysql:host={$host};dbname={$db};charset={$charset}";

        $opciones = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $this->conexion = new PDO($dsn, $user, $pass, $opciones);
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['error' => 'No se pudo conectar a la base de datos.']);
            exit;
        }
    }

    // Evita que alguien pueda clonar la instancia y romper el "único objeto".
    private function __clone() {}

    public static function getInstance(): Database
    {
        if (self::$instancia === null) {
            self::$instancia = new self();
        }
        return self::$instancia;
    }

    public function getConexion(): PDO
    {
        return $this->conexion;
    }
}