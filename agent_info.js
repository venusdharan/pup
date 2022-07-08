const si = require('systeminformation');

module.exports.getinfo = async function(){
    var result = {};
    result.hardware = await si.system();
    delete result.hardware.serial
    delete result.hardware.uuid
    delete result.hardware.sku
    result.cpu = await si.cpu();
    delete result.cpu.flags 
    delete result.cpu.cache
    delete result.cpu.family
    delete result.cpu.model
    delete result.cpu.stepping
    delete result.cpu.voltage
    delete result.cpu.speed
    delete result.cpu.speedMin
    delete result.cpu.speedMax
    delete result.cpu.governor 
    delete result.cpu.socket
    delete result.cpu.revision
    result.memory = await si.mem();
    //delete result.memory.used
    delete result.memory.active
    delete result.memory.available
    delete result.memory.buffers
    delete result.memory.cached
    delete result.memory.slab
    delete result.memory.buffcache
    delete result.memory.swaptotal
    delete result.memory.swapused
    delete result.memory.swapfree
    result.os = await si.osInfo();
    delete result.os.build
    delete result.os.servicepack
    return result;
}
