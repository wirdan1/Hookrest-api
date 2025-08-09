const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.enable("trust proxy");
app.set("json spaces", 2);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Load settings.json dengan penanganan error
const settingsPath = path.join(__dirname, './src/settings.json');
let settings;
try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
} catch (err) {
    console.error(chalk.bgRed.hex('#FFF').bold('Error reading settings.json:', err.message));
    process.exit(1);
}

// Middleware untuk cek maintenance mode
app.use((req, res, next) => {
    if (settings.maintenance && settings.maintenance.enabled === true) {
        const maintenancePath = path.join(__dirname, 'api-page', 'maintenance.html');
        if (fs.existsSync(maintenancePath)) {
            return res.status(503).sendFile(maintenancePath);
        } else {
            console.error(chalk.bgRed.hex('#FFF').bold('Maintenance file not found:', maintenancePath));
            return res.status(503).json({
                status: 'error',
                message: 'Server is under maintenance, but maintenance page is not available.'
            });
        }
    }
    next();
});

app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
        if (data && typeof data === 'object') {
            const responseData = {
                status: data.status,
                creator: settings.apiSettings.creator || "Created Using Rynn UI",
                ...data
            };
            return originalJson.call(this, responseData);
        }
        return originalJson.call(this, data);
    };
    next();
});

// Api Route
let totalRoutes = 0;
const apiFolder = path.join(__dirname, './src/api');
fs.readdirSync(apiFolder).forEach((subfolder) => {
    const subfolderPath = path.join(apiFolder, subfolder);
    if (fs.statSync(subfolderPath).isDirectory()) {
        fs.readdirSync(subfolderPath).forEach((file) => {
            const filePath = path.join(subfolderPath, file);
            if (path.extname(file) === '.js') {
                require(filePath)(app);
                totalRoutes++;
                console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Loaded Route: ${path.basename(file)} `));
            }
        });
    }
});
console.log(chalk.bgHex('#90EE90').hex('#333').bold(' Load Complete! ✓ '));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Total Routes Loaded: ${totalRoutes} `));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'api-page', '404.html'));
});

app.use((err, req, res, next) => {
    console.error(chalk.bgRed.hex('#FFF').bold(err.stack));
    res.status(500).sendFile(path.join(__dirname, 'api-page', '500.html'));
});

app.listen(PORT, () => {
    console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Server is running on port ${PORT} `));
});

module.exports = app;
