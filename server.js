import express from 'express';
import pm2 from 'pm2';
import dayjs from 'dayjs';
import morgan from 'morgan';
import helmet  from 'helmet';
import cors  from 'cors';
import compression from 'compression';

const app = express();
app.use(cors()); 
app.use(
    express.urlencoded({
      limit: '50mb', 
      extended: true,
    }),
    
  );
app.use(express.json({limit: '50mb'}));

/* Anchor === irisAdmin LOG === */
app.use(morgan('tiny'));
app.use(compression());
/* Anchor === Express Security === */
app.use(helmet());

app.get('/monitoring', (req, res) => {
    try {
        pm2.connect((err) => {
            if (err) {
                console.error('Error connecting to PM2:', err);
                pm2.disconnect()
                return res.status(500).json({code: 500, message: err});
            }
            pm2.list((err, list) => {
                if (err) {
                console.error('Error getting PM2 list:', err);
                res.status(500).json({ message: err });
                return;
                }
                const targetNames = ["pbro_reg1", "pbro_reg2", "pbro_reg3", "pbro_reg4", "rekonsales", "pbrodetail", "lisdc", "botwareg4", "absenharian","iris-strukol","cekprodmast"];
                const dataPm2 = list.filter(r => targetNames.includes(r.name));

                const onlineProcesses = dataPm2.filter(pm2_inv => pm2_inv.pm2_env.status === 'online').map((r)=>{
                return {
                    id: r.pm_id,
                    name: r.name,
                    cpu: r.monit.cpu,
                    memory: (r.monit.memory/ (1024 * 1024)).toFixed(2),
                    pm2_status: r.pm2_env.status,
                    pm2_uptime: dayjs(r.pm2_env.pm_uptime).format('YYYY-MM-DD HH:mm:ss')
                }
                });
                const offlineProcesses = dataPm2.filter(pm2_inv => pm2_inv.pm2_env.status != 'online').map((r)=>{
                return {
                    id: r.pm_id,
                    name: r.name,
                    cpu: r.monit.cpu,
                    memory: (r.monit.memory/ (1024 * 1024)).toFixed(2),
                    pm2_status: r.pm2_env.status,
                    pm2_uptime: dayjs(r.pm2_env.pm_uptime).format('YYYY-MM-DD HH:mm:ss')
                }
                });
        
                const monitoringData = {
                online: onlineProcesses,
                offline: offlineProcesses
                };
        
                res.json(monitoringData);
            });
        })
    } catch (error) {
        return res.status(500).json({code: 500, message: error});
    }
});

app.post('/start', (req, res) => {
    try {

        const nama_service = req.body.name

        pm2.connect((err) => {
            if (err) {
                console.error('Error connecting to PM2:', err);
                pm2.disconnect()
                return res.status(500).json({code: 500, message: err});
            }            
            pm2.start(nama_service, (err) => {
                if (err) {
                    console.error(`Error Start PM2: ${nama_service}`);
                    res.status(500).json({ message: err });
                    return;
                } 
        
                res.json({message: `Start ${nama_service} Berhasil`});
            });
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({code: 500, message: error});
    }
})


app.post('/stop', (req, res) => {
    try {

        const nama_service = req.body.name

        pm2.connect((err) => {
            if (err) {
                console.error('Error connecting to PM2:', err);
                pm2.disconnect()
                return res.status(500).json({code: 500, message: err});
            }            
            pm2.stop(nama_service, (err) => {
                if (err) {
                    console.error(`Error STOP PM2: ${nama_service}`);
                    res.status(500).json({ message: err });
                    return;
                } 
        
                res.json({message: `Stop ${nama_service} Berhasil`});
            });
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({code: 500, message: error});
    }
})

// Start the server
const PORT = process.env.PORT || 7888;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
