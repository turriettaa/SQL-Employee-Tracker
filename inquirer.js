const inquirer = require('inquirer');
const db = require('./db');

async function viewAllDepartments() {
  const departments = await db.query('SELECT * FROM department');
  console.table(departments);
}

async function viewAllRoles() {
  const roles = await db.query(`
    SELECT role.id, role.title, department.name AS department, role.salary 
    FROM role 
    JOIN department ON role.department_id = department.id
  `);
  console.table(roles);
}

async function viewAllEmployees() {
  const employees = await db.query(`
    SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, 
           CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role ON e.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee m ON e.manager_id = m.id
  `);
  console.table(employees);
}

async function addDepartment() {
  const { departmentName } = await inquirer.prompt([
    {
      name: 'departmentName',
      type: 'input',
      message: 'What is the name of the department?',
      validate: input => input ? true : 'Department name cannot be empty.'
    }
  ]);

  await db.query('INSERT INTO department (name) VALUES ($1)', [departmentName]);
  console.log(`Added ${departmentName} to the database`);
}

async function addRole() {
  const departments = await db.query('SELECT id, name FROM department');
  
  const { title, salary, departmentId } = await inquirer.prompt([
    {
      name: 'title',
      type: 'input',
      message: 'What is the name of the role?',
      validate: input => input ? true : 'Role name cannot be empty.'
    },
    {
      name: 'salary',
      type: 'input',
      message: 'What is the salary of the role?',
      validate: input => !isNaN(input) && input > 0 ? true : 'Please enter a valid salary.'
    },
    {
      name: 'departmentId',
      type: 'list',
      message: 'Which department does the role belong to?',
      choices: departments.map(dept => ({ name: dept.name, value: dept.id }))
    }
  ]);

  await db.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, departmentId]);
  console.log(`Added ${title} role to the database`);
}

async function addEmployee() {
    console.log('Starting addEmployee function');
    const roles = await db.query('SELECT id, title FROM role');
    console.log('Roles retrieved:', roles);
  const managers = await db.query('SELECT id, first_name, last_name FROM employee');

  const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
    {
      name: 'firstName',
      type: 'input',
      message: "What is the employee's first name?",
      validate: input => input ? true : 'First name cannot be empty.'
    },
    {
      name: 'lastName',
      type: 'input',
      message: "What is the employee's last name?",
      validate: input => input ? true : 'Last name cannot be empty.'
    },
    {
       name: 'roleId',
        type: 'list',
        message: "What is the employee's role?",
        choices: roles.length > 0 
          ? roles.map(role => ({ name: role.title, value: role.id }))
          : [{ name: 'No roles available', value: null }]
    },
    {
      name: 'managerId',
      type: 'list',
      message: "Who is the employee's manager?",
      choices: [
        { name: 'None', value: null },
        ...managers.map(mgr => ({ name: `${mgr.first_name} ${mgr.last_name}`, value: mgr.id }))
      ]
    }
  ]);

  await db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', 
    [firstName, lastName, roleId, managerId]);
  console.log(`Added ${firstName} ${lastName} to the database`);
}

async function updateEmployeeRole() {
  const employees = await db.query('SELECT id, first_name, last_name FROM employee');
  const roles = await db.query('SELECT id, title FROM role');

  const { employeeId, roleId } = await inquirer.prompt([
    {
      name: 'employeeId',
      type: 'list',
      message: 'Which employee\'s role do you want to update?',
      choices: employees.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }))
    },
    {
      name: 'roleId',
      type: 'list',
      message: 'Which role do you want to assign the selected employee?',
      choices: roles.map(role => ({ name: role.title, value: role.id }))
    }
  ]);

  await db.query('UPDATE employee SET role_id = $1 WHERE id = $2', [roleId, employeeId]);
  console.log(`Updated employee's role`);
}

module.exports = {
  viewAllDepartments,
  viewAllRoles,
  viewAllEmployees,
  addDepartment,
  addRole,
  addEmployee,
  updateEmployeeRole
};
