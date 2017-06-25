/**
 * 本文件中所有io操作都必须是同步
 */
const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v1');
const { getDevDependencies } = require('./tools.js');

const rootdir = process.cwd();
const tempDir = 'src'; //后期可以cut
const DIR = `${rootdir}/${tempDir}`; //后期可以cut

//后缀名，目前按.js
const extname = '.js';
const structure = {};
try {
    structure = require('../conf/relations.json');
    structure[tempDir] = structure.relations;
} catch (e) {
    structure[tempDir] = {};
}
structure.devDependencies = getDevDependencies();
/**
 * 生成文档结构和关系
 */
exports.generateSt = path => {
    readdir(DIR);
    structure.relations = structure[tempDir];
    delete structure[tempDir];
    fs.writeFileSync('./server/conf/relations.json', JSON.stringify(structure, null, 4));
}
/**
 * 读取目录结构
 */
function readdir(path) {
    const isExist = fs.existsSync(path);
    if (isExist) {
        const dirList = fs.readdirSync(path);
        dirList.forEach(name => {
            var currPath = `${path}/${name}`;
            var stat = fs.statSync(currPath);
            if (stat.isDirectory()) {
                setJson(structure, currPath);
                readdir(currPath);
            }
            if (stat.isFile()) {
                var modules = searchModulePath(currPath);
                setJson(structure, currPath, 'isFile', modules);
            }
        })
    }
}
/**
 * 生成structure结构
 */
function setJson(obj, path, flag, modules) {
    var arr = formatPath(path);
    if (typeof obj === 'object' && Array.isArray(arr)) {
        var currAttr = obj[arr[0]];

        for (var i = 1; i < arr.length; i++) {
            var elem = arr[i];
            if (i < arr.length - 1) {
                if (!currAttr[elem]) {
                    currAttr[elem] = {};
                }
            }
            if (i === arr.length - 1 && flag === 'isFile') {
                if (!currAttr[elem]) {
                    currAttr[elem] = {};
                    currAttr[elem].id = `_${uuid()}`;
                    currAttr[elem].dir = path.replace(rootdir, '').replace(/\/\w*\.\w*$/, '');
                    currAttr[elem].input = modules || [];
                    currAttr[elem].pos = {};
                }
            }
            currAttr = currAttr[elem];
        }
    }
}
/**
 * 根据的提供的path，生成[]
 */
function formatPath(path) {
    if (typeof path === 'string') {
        return path.replace(rootdir, '').split('/').slice(1);
    }
    return path;
}

/**
 * 读取文件中包含信息，提取 import {} from 'antd'中的'antd'
 */
function searchModulePath(path) {
    if (typeof path === 'string') {
        const data = fs.readFileSync(path, 'utf8');
        var allResult = data.match(/\bimport.*from.*((\'.*\')|(\".*\"))/g) || [];
        var matchResult = allResult.map(item => {
            return item.match(/(\".*\")|(\'.*\')/)[0].replace(/"|'/g, '');
        })

        return parseModulePath(path, matchResult);
    }
}
/**
 * 把'../model/index[.js]'解析成 ['model', 'index.js'];
 */
function parseModulePath(currPath, moduleArr) {
    if (Array.isArray(moduleArr)) {
        const result = moduleArr.map(module => {
            module = module.replace(/index$/, `index${extname}`);
            const Reg = /^(\.\.\/|\.\/)/;
            if (Reg.test(module)) {
                currPath = currPath.replace(/(\\|\/){1}\w*\.\w*$/, '');
                module = module.replace(/index$/, `index${extname}`);
                return module = path.resolve(currPath, module).replace(rootdir, '').split(/\\|\//).slice(2);
            }
            return module;
        })
        return result;
    }
    return moduleArr;
}

/**
 * 生成随机的坐标
 */
function randomPos() {
    return {
        x: Math.ceil(Math.random() * 600) + 50,
        y: Math.ceil(Math.random() * 600)
    }
}
