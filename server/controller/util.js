const fs = require('fs');
const Path = require('path');

const rootdir = process.cwd();
const standard = require(`${rootdir}/.soyz/config.json`).standard;
/**
 * 两个文件之间建立引用关系
 */
exports.buildRelations = relation => {
    if (typeof relation === 'object' && relation.fromA && relation.toB) {
        var fromPath, toPath;
        if (!relation.toB.dir) {
            doneRelation(relation.fromA.dir, relation.toB.name);
        } else {
            const fromPath = Path.dirname(relation.fromA.dir);
            const text = Path.relative(fromPath, relation.toB.dir).replace(/\\/g, '/');
            doneRelation(relation.fromA.dir, text);
        }
    }
}

/**
 * 把引用关系写入到文件中 
 */
function doneRelation(targetPath, text) {
    var line;
    if (standard === 'ES6') {
        line = `import {} from '${text}';\r\n`;
    } else if (standard === 'CommonJs') {
        line = `const {} = require('${text}');\r\n`;
    }
    try {
        const currPath = rootdir + targetPath;
        const isExist = fs.existsSync(currPath);
        if (!isExist) return;
        const data = fs.readFileSync(currPath, 'utf8');
        fs.writeFileSync(currPath, `${line}${data}`, 'utf8');
    } catch (e) {
        console.log(`${currPaht} is not exist!`);
    }
}
