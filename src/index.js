const { 
    QMainWindow,
    QMovie,
    QLabel,
    QWidget,
    FlexLayout,
    QSize, 
    QTabWidget, 
    QListWidget, 
    QListWidgetItem, 
    QIcon, 
    QMessageBox, 
    QPushButton, 
    AlignmentFlag,  
} = require('@nodegui/nodegui');
const axios = require('axios').default;
const os = require('os');
const si = require('systeminformation')

const win = new QMainWindow();
win.setWindowTitle("系統資訊");

const main = async () => {

    // 畫面佈局
    const mainView = new QWidget()
    mainView.setLayout(new FlexLayout)
    mainView.setObjectName("mainView")

    // label container
    const labelContainer = new QWidget()
    labelContainer.setLayout(new FlexLayout())
    labelContainer.setObjectName('labelContainer')

    // main container
    const mainContainer = new QWidget()
    mainContainer.setLayout(new FlexLayout())
    mainContainer.setObjectName('mainContainer')

    // in label container
    const mainLabel = new QLabel();
    mainLabel.setText(os.hostname)
    mainLabel.setObjectName('mainLabel')
    mainLabel.setAlignment(AlignmentFlag.AlignCenter)

    labelContainer.layout.addWidget(mainLabel)

    // in main container
    const loadingContainer = new QWidget()
    loadingContainer.setLayout(new FlexLayout())
    loadingContainer.setObjectName('loadingContainer')
    
    // in loading container
    const loadingGif = new QLabel();
    loadingGif.setInlineStyle(`width: ${loadingGif.size().width()}`);
    loadingGif.setObjectName('loadingGif')
    loadingGif.setAlignment(AlignmentFlag.AlignCenter)

    // gif movie
    const gifMovie = await getMovie(
        'https://icon-library.com/images/loading-gif-icon/loading-gif-icon-0.jpg'
    );

    gifMovie.setCacheMode(QMovie.CacheAll)
    gifMovie.setSpeed(200)
    gifMovie.setScaledSize(new QSize(640 , 400))
    loadingGif.setMovie(gifMovie);
    gifMovie.start()

    loadingContainer.layout.addWidget(loadingGif)
    mainContainer.layout.addWidget(loadingContainer)

    // in main view
    mainView.layout.addWidget(labelContainer);
    mainView.layout.addWidget(mainContainer);
    win.setCentralWidget(mainView);

    mainView.setStyleSheet(`
        #mainView {
            flex: 1;
        }
        #labelContainer {
            display: flex;
            flex: 1;
            background-color: #000000;
        }
        #mainLabel {
            flex-grow: 1;
            color: #00ff40;
            font-size: 20px;
            font-weight: bold;
        }
        #mainContainer {
            flex: 9;
            align-items: 'center';
            justify-content: 'center';
            background-color: #ffffff;
        }
        #loadingContainer {
            height: 100;
            width: '640px';
            flex-direction: 'row';
            flex-wrap: 'wrap';
            justify-content: 'center';
            align-items: 'center';
            background-color: #ffffff;
        }
        #loadingGif {
            width: '100%';
            height: '100%';
        }
        #allContainer {
            flex: 1;
            align-items: 'flex-start';
            width: '100%';
            height: '100%';
        }
        #detailsList {
            flex: 1;
            background-color: #9d9d9d;
            color: '#000';
            height: '100%';
            width: '100%';
        }
        #tabBar {
            flex: 4;
            height: '100%';
            align-items: 'center';
            justify-content: 'center';
        }
        #postButton {
            margin: 5px;
            width: '90%';
            height: 35px;
        }
        #topContainer {
            flex-direction: 'row';
            flex: 3;
            width: '100%';
        }
        #underContainer {
            flex: 2;
            width: '100%';
        }
        #buttonContainer {
            flex: 1;
            justify-content: 'center';
            width: '100%';
        }
    `);
    
    // 等待取得資料
    Promise.all([systemInfo]).then(async ([sysInfo]) => {
        loadingGif.clear();
        const systemInfoContainer = await createSystemInfoView(sysInfo)
        mainContainer.layout.removeWidget(loadingContainer)
        mainContainer.layout.addWidget(systemInfoContainer)
        
        renderView()
    })

    renderView()
};

/**
 * getMovie
 * 取得gif
 * @param {String} url 
 * @returns 
 */
async function getMovie(url) {
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });
    const movie = new QMovie();
    movie.loadFromData(data);
    movie.start()
    return movie
}

/**
 * systemInfo
 * 取得系統資訊
 */
const systemInfo = new Promise((resolve) => {
    let valueObject = {
        cpu: '*',
        baseboard: '*',
        memLayout: '*',
        graphics: 'controllers',
        diskLayout: '*'
    }

    resolve(si.get(valueObject).then((systemInfo) => { return systemInfo }))
})

/**
 * createSystemInfoView
 * 
 * @param {*} sysInfo 
 * @returns 
 */
const createSystemInfoView = async (sysInfo) => {

    // declarative element
    const allContainer = new QWidget()
    allContainer.setLayout(new FlexLayout())
    allContainer.setObjectName('allContainer')

    const topContainer = new QWidget()
    topContainer.setLayout(new FlexLayout())
    topContainer.setObjectName('topContainer')
 
    const underContainer = new QWidget()
    underContainer.setLayout(new FlexLayout())
    underContainer.setObjectName('underContainer')

    const buttonContainer = new QWidget()
    buttonContainer.setLayout(new FlexLayout())
    buttonContainer.setObjectName('buttonContainer')

    const tabBar = new QTabWidget()
    tabBar.setObjectName('tabBar')

    const detailsList = new QListWidget()
    detailsList.setObjectName('detailsList')

    const postButton = new QPushButton()
    postButton.setObjectName('postButton')
    postButton.setText(' 🔎 ')

    const cpu = new QListWidget()
    const mb = new QListWidget()
    const ram = new QListWidget()
    const gpu = new QListWidget()
    const disk = new QListWidget()
    
    // create tabBar item
    createTabBarItems()
    // combine the container
    combineContainer()
    // create listener
    createListener()

    return allContainer

    /**
     * createTabBarItems
     * 資料寫入tabBar item中
     */
    function createTabBarItems() {
        // cpu
        const cpu_i = new QListWidgetItem()
        const cpuName = sysInfo.cpu.manufacturer + sysInfo.cpu.brand
        cpu_i.setText(cpuName)
        cpu.addItem(cpu_i)

        // mb
        const mb_i = new QListWidgetItem()
        const mbName = sysInfo.baseboard.manufacturer + sysInfo.baseboard.model
        mb_i.setText(mbName)
        mb.addItem(mb_i)

        // ram
        let totalRam = 0
        sysInfo.memLayout.forEach((mem) => {
            let ram_i = new QListWidgetItem()
            ram_i.setText(mem.manufacturer + '-' + mem.partNum)
            ram.addItem(ram_i)
            totalRam = totalRam + mem.size
        })
        // total ram
        let total = new QListWidgetItem()
        total.setText('Total :' + bytesToSize(totalRam))
        ram.addItem(total)

        // disk
        sysInfo.diskLayout.forEach((diskItem) => {
            let disk_i = new QListWidgetItem()
            disk_i.setText(diskItem.name)
            disk.addItem(disk_i)
        })

        // gpu
        sysInfo.graphics.controllers.forEach((gpuItem) => {
            let gpu_i = new QListWidgetItem()
            gpu_i.setText(gpuItem.model)
            gpu.addItem(gpu_i)
        })

        tabBar.addTab(cpu, new QIcon(), 'CPU')
        tabBar.addTab(mb, new QIcon(), 'MB')
        tabBar.addTab(ram, new QIcon(), 'RAM')
        tabBar.addTab(gpu, new QIcon(), 'GPU')
        tabBar.addTab(disk, new QIcon(), 'SSD & HDD')
    }
    
    /**
     * combineContainer
     * 組合容器
     */
    function combineContainer() {
        // postButton in buttonContainer
        buttonContainer.layout.addWidget(postButton)
        // tabBar & buttonContainer in topContainer
        topContainer.layout.addWidget(tabBar)
        topContainer.layout.addWidget(buttonContainer)
        // detailsList in underContainer
        underContainer.layout.addWidget(detailsList)
        // topContainer & underContainer in allContainer
        allContainer.layout.addWidget(topContainer)
        allContainer.layout.addWidget(underContainer)
    }

    /**
     * createListener
     * 監聽組件功能事件
     */
    function createListener() {
        // cpu
        cpu.addEventListener('itemClicked', async (data) => {
            // showModal(sysInfo.cpu)
            detailsList.clear()
            detailsList.addItems(await showInfoDetails(sysInfo.cpu))
        })
        // mb
        mb.addEventListener('itemClicked', async (data) => {
            // showModal(sysInfo.baseboard)
            detailsList.clear()
            detailsList.addItems(await showInfoDetails(sysInfo.baseboard))
        })
        // disk
        disk.addEventListener('itemClicked', async (data) => {
            detailsList.clear()
            let itemIndex = disk.row(new QListWidgetItem(data))
            detailsList.addItems(await showInfoDetails(sysInfo.diskLayout[itemIndex]))
        })
        // ram
        ram.addEventListener('itemClicked', async (data) => {
            let itemIndex = ram.row(new QListWidgetItem(data))
            if (itemIndex !== (ram.count() - 1)) {
                detailsList.clear()
                detailsList.addItems(await showInfoDetails(sysInfo.memLayout[itemIndex]))
                // showModal(sysInfo.memLayout[itemIndex])
            }
        })
        // gpu
        gpu.addEventListener('itemClicked', async (data) => {
            let itemIndex = gpu.row(new QListWidgetItem(data))
            detailsList.clear()
            detailsList.addItems(await showInfoDetails(sysInfo.graphics.controllers[itemIndex]))
            // showModal(sysInfo.graphics.controllers[itemIndex])
        })
        // button
        postButton.addEventListener('clicked', () => {
            console.log(win.size().height(), win.size().width())
        })
    }
}

/**
 * renderView
 * 畫面渲染重讀
 */
const renderView = async () => {
    win.setMinimumSize(700, 560)
    // win.setMaximumSize(1400, 1120)
    win.show();
    global.win = win;
}

/**
 * showModal
 * message box 通知模式
 * @param {Object} details 
 */
const showModal = async (details) => {
    let str = ''
    for (const [key, value] of Object.entries(details)) {
        str = str + `${key}: ${value} \n`
    }
    const modal = new QMessageBox();
    modal.setText(str);
    const okButton = new QPushButton();
    okButton.setText('OK');
    modal.addButton(okButton);
    modal.exec();
}

/**
 * showInfoDetails
 * 右側資訊
 * @param {Object} details 
 * @returns 
 */
const showInfoDetails = async (details) => {
    let infoArray = []
    const zhTranslateData = myConfig.zh;
    for (const [key, value] of Object.entries(details)) {
        if (typeof value !== 'object' && !Array.isArray(value) && value !== null) {
            if (value !== "") {
                if (key in zhTranslateData) {
                    if (key == 'size'){
                        infoArray.push(`${zhTranslateData[key]}: ${bytesToSize(value)}`)
                    } else infoArray.push(`${zhTranslateData[key]}: ${value}`)
                } else {
                    infoArray.push(`${key}: ${value}`)
                }
            }
        }
    }
    return infoArray;
}

/**
 * bytesToSize
 * bytes 大小格式化轉換
 * @param {Integer} bytes 
 * @returns 
 */
function bytesToSize(bytes) {
    if (bytes == 0) return '0 B'

    var k = 1024

    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return ((bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i])
}

main().catch(console.error);
