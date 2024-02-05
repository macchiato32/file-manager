import fs from "fs";
import os from "os";
import crypto from "crypto";
import zlib from "zlib";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const username = process.argv[2].split("=")[1];
const homeDir = os.homedir();
let cwd = homeDir;

console.log(`Welcome to the File Manager, ${username}!`);
console.log(`You are currently in ${cwd}`);

/**
 * function to prompt the user for a command
 */
function prompt() {
  rl.question("> ", (input) => {
    const words = input.split(" ");
    const command = words[0];
    const args = words.slice(1);
    execute(command, args);
  });
}

/**
 * function to execute the command with the arguments
 * @param {*} command 
 * @param {*} args 
 */
function execute(command, args) {
  switch (command) {
    case "up":
      up();
      break;
    case "cd":
      cd(args[0]);
      break;
    case "ls":
      ls();
      break;
    case "cat":
      cat(args[0]);
      break;
    case "add":
      add(args[0]);
      break;
    case "rn":
      rn(args[0], args[1]);
      break;
    case "cp":
      cp(args[0], args[1]);
      break;
    case "mv":
      mv(args[0], args[1]);
      break;
    case "rm":
      rm(args[0]);
      break;
    case "os":
      osInfo(args[0]);
      break;
    case "hash":
      hash(args[0]);
      break;
    case "compress":
      compress(args[0]);
      break;
    case "decompress":
      decompress(args[0]);
      break;
    case ".exit":
      exit();
      break;
    default:
      invalid();
      break;
  }
}

/**
 * function to go to the parent directory
 */
function up() {
  const parentDir = cwd.split("/").slice(0, -1).join("/");
  if (parentDir) {
    cwd = parentDir;
    console.log(`You are currently in ${cwd}`);
  }
  prompt();
}

/**
 * function to go to the specified directory
 */
function cd(dir) {
  if (dir) {
    const absDir = resolve(dir);
    fs.stat(absDir, (err, stats) => {
      if (err) {
        console.log("Operation failed");
      } else if (stats.isDirectory()) {
        cwd = absDir;
        console.log(`You are currently in ${cwd}`);
      } else {
        console.log("Invalid input");
      }
      prompt();
    });
  } else {
    console.log("Invalid input");
    prompt();
  }
}

/**
 * function to list the files and folders in the current directory
 */
function ls() {
  fs.readdir(cwd, (err, files) => {
    if (err) {
      console.log("Operation failed");
    } else {
      files.sort();
      const output = [];
      for (const file of files) {
        const fullPath = resolve(file);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          output.push(`${file}/\t[dir]`);
        } else {
          output.push(`${file}\t[file]`);
        }
      }
      console.log(output.join("\n"));
    }
    prompt();
  });
}
/**
 * function to read and print the content of the specified file
 */
//
function cat(file) {
  if (file) {
    const absFile = resolve(file);
    fs.stat(absFile, (err, stats) => {
      if (err) {
        console.log("Operation failed");
      } else if (stats.isFile()) {
        const stream = fs.createReadStream(absFile);
        stream.pipe(process.stdout);
        stream.on("end", () => {
          prompt();
        });
      } else {
        console.log("Invalid input");
        prompt();
      }
    });
  } else {
    console.log("Invalid input");
    prompt();
  }
}
/**
 * function to create an empty file with the specified name
 * @param {*} name
 */
function add(name) {
  if (name) {
    const absName = resolve(name);
    fs.writeFile(absName, Buffer.alloc(0), (err) => {
      if (err) {
        console.log("Operation failed");
      } else {
        console.log("File created successfully");
      }
      prompt();
    });
  } else {
    console.log("Invalid input");
    prompt();
  }
}
/**
 *  function to rename the specified file with the new name
 * @param {*} file
 * @param {*} newName
 */
function rn(file, newName) {
  if (file && newName) {
    const absFile = resolve(file);
    const absNewName = resolve(newName);
    fs.rename(absFile, absNewName, (err) => {
      if (err) {
        console.log("Operation failed");
      } else {
        console.log("File renamed successfully");
      }
      prompt();
    });
  } else {
    console.log("Invalid input");
    prompt();
  }
}

/**
 * function to copy the specified file to the new directory
 * @param {*} file
 * @param {*} dir
 */
function cp(file, dir) {
  if (file && dir) {
    const absFile = resolve(file);
    const absDir = resolve(dir);
    fs.stat(absFile, (err, stats) => {
      if (err) {
        console.log("Operation failed");
      } else if (stats.isFile()) {
        fs.stat(absDir, (err, stats) => {
          if (err) {
            console.log("Operation failed");
          } else if (stats.isDirectory()) {
            const fileName = file.split("/").pop();
            const readStream = fs.createReadStream(absFile);
            const writeStream = fs.createWriteStream(`${absDir}/${fileName}`);
            readStream.pipe(writeStream);
            writeStream.on("finish", () => {
              console.log("File copied successfully");
              prompt();
            });
          } else {
            console.log("Invalid input");
            prompt();
          }
        });
      } else {
        console.log("Invalid input");
        prompt();
      }
    });
  } else {
    console.log("Invalid input");
    prompt();
  }
}

/**
 * Well here`s function to move the specified file to the new directory
 * @param {*} file
 * @param {*} dir
 */
function mv(file, dir) {
  if (file && dir) {
    const absFile = resolve(file);
    const absDir = resolve(dir);
    fs.stat(absFile, (err, stats) => {
      if (err) {
        console.log("Operation failed");
      } else if (stats.isFile()) {
        fs.stat(absDir, (err, stats) => {
          if (err) {
            console.log("Operation failed");
          } else if (stats.isDirectory()) {
            const fileName = file.split("/").pop();
            const readStream = fs.createReadStream(absFile);
            const writeStream = fs.createWriteStream(`${absDir}/${fileName}`);
            readStream.pipe(writeStream);
            writeStream.on("finish", () => {
              fs.unlink(absFile, (err) => {
                if (err) {
                  console.log("Operation failed");
                } else {
                  console.log("File moved successfully");
                }
                prompt();
              });
            });
          } else {
            console.log("Invalid input");
            prompt();
          }
        });
      } else {
        console.log("Invalid input");
        prompt();
      }
    });
  } else {
    console.log("Invalid input");
    prompt();
  }
}

/**
 * function to delete the specified file
 * @param {*} file
 */
function rm(file) {
  if (file) {
    const absFile = resolve(file);
    fs.unlink(absFile, (err) => {
      if (err) {
        console.log("Operation failed");
      } else {
        console.log("File deleted successfully");
      }
      prompt();
    });
  } else {
    console.log("Invalid input");
    prompt();
  }
}
/**
 * function to get the operating system information
 * @param {*} option
 */
function osInfo(option) {
  if (option) {
    switch (option) {
      case "--EOL":
        console.log(`The default system end-of-line is ${os.EOL}`);
        break;
      case "--cpus":
        console.log(`The host machine has ${os.cpus().length} CPUs`);
        for (const cpu of os.cpus()) {
          console.log(
            `Model: ${cpu.model}, Clock rate: ${cpu.speed / 1000} GHz`
          );
        }
        break;
      case "--homedir":
        console.log(`The home directory is ${os.homedir()}`);
        break;
      case "--username":
        console.log(
          `The current system user name is ${os.userInfo().username}`
        );
        break;
      case "--architecture":
        console.log(`The CPU architecture is ${os.arch()}`);
        break;
      default:
        console.log("Invalid input");
        break;
    }
  } else {
    console.log("Invalid input");
  }
  prompt();
}

/**
 * function to calculate the hash of the specified file
 * @param {*} file
 */
function hash(file) {
  if (file) {
    const absFile = resolve(file);
    fs.stat(absFile, (err, stats) => {
      if (err) {
        console.log("Operation failed");
      } else if (stats.isFile()) {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(absFile);
        stream.pipe(hash);
        stream.on("end", () => {
          console.log(`The hash of the file is ${hash.digest("hex")}`);
          prompt();
        });
      } else {
        console.log("Invalid input");
        prompt();
      }
    });
  } else {
    console.log("Invalid input");
    prompt();
  }
}

/**
 * function to compress the specified file with gzip (oh noes, brotlie)
 * @param {*} file
 */
function compress(file) {
  if (file) {
    const absFile = resolve(file);
    fs.stat(absFile, (err, stats) => {
      if (err) {
        console.log("Operation failed");
      } else if (stats.isFile()) {
        const fileName = file.split("/").pop();
        const readStream = fs.createReadStream(absFile);
        const writeStream = fs.createWriteStream(`${cwd}/${fileName}.br`);
        const brotli = zlib.createBrotliCompress();
        readStream.pipe(brotli).pipe(writeStream);
        writeStream.on("finish", () => {
          console.log("File compressed successfully");
          prompt();
        });
      } else {
        console.log("Invalid input");
        prompt();
      }
    });
  } else {
    console.log("Invalid input");
    prompt();
  }
}

function decompress(file) {
  if (file) {
    const absFile = resolve(file);
    fs.stat(absFile, (err, stats) => {
      if (err) {
        console.log("Operation failed");
      } else if (stats.isFile()) {
        if (file.endsWith(".br")) {
          const fileName = file.split("/").pop().slice(0, -3);
          const readStream = fs.createReadStream(absFile);
          const writeStream = fs.createWriteStream(`${cwd}/${fileName}`);
          const brotli = zlib.createBrotliDecompress();
          readStream.pipe(brotli).pipe(writeStream);
          writeStream.on("finish", () => {
            console.log("File decompressed successfully");
            prompt();
          });
        } else {
          console.log("Invalid input");
          prompt();
        }
      } else {
        console.log("Invalid input");
        prompt();
      }
    });
  } else {
    console.log("Invalid input");
    prompt();
  }
}

function exit() {
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  rl.close();
}
/**
 * function to display an invalid input message
 */
function invalid() {
  console.log("Invalid input");
  prompt();
}
/**
 * function to resolve a path to an absolute path
 * @param {*} path
 * @returns
 */
function resolve(path) {
  if (path.startsWith("/")) {
    return path;
  } else {
    return `${cwd}/${path}`;
  }
}

/**
 * here we go again!
 */
prompt();
