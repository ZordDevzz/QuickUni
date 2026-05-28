import { db } from "../index";
import { 
  account, 
  profile, 
  employee, 
  student, 
  userSystemRole, 
  departmentEmployment,
  mainClass,
  mainClassMember,
  educationType
} from "../schema";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";

export const seedPeople = async (
  studentSchemaId: number,
  employeeSchemaId: number,
  roles: any,
  departments: any[],
  majors: any[]
) => {
  console.log("👥 Seeding people (realistic Vietnamese accounts)...");
  const pwdHash = await hash("password123", 10);

  // 1. Seed Education Type first
  const [eduType] = await db.insert(educationType).values({
    code: "CQ",
    name: "Đại học chính quy",
    des: "Hệ đào tạo đại học chính quy 4 năm",
    length: 4,
  }).returning();

  // 1.5. Profile and Employee for Admin Account (to make Admin a proper Person)
  const adminId = "f90abb36-d7b2-47a3-84f4-f9c7b977a9a7";
  const adminProfileId = randomUUID();
  const adminEmployeeId = randomUUID();

  // Insert Admin Profile
  await db.insert(profile).values({
    id: adminProfileId,
    accountId: adminId,
    schemaId: employeeSchemaId,
    fullname: "Quản trị viên Hệ thống",
    gender: "male",
    dob: "1980-01-01",
    nationalId: "001080000001",
    dynamicData: { personal_email: "admin@gmail.com", phone: "0999999999" }
  });

  // Insert Admin Employee Record
  await db.insert(employee).values({
    id: adminEmployeeId,
    profileId: adminProfileId,
    code: "AD00001"
  });

  // Assign Admin to AAO Department (Phòng Đào tạo)
  const aaoDept = departments.find(d => d.code === "AAO")!;
  await db.insert(departmentEmployment).values({
    employeeId: adminEmployeeId,
    departmentId: aaoDept.id,
    assignDate: "2020-09-01",
    roleCode: "ADMINISTRATOR",
    roleName: "Giám đốc hệ thống thông tin"
  });

  // 2. Academic Office Staff
  const academicAccountId = randomUUID();
  const academicProfileId = randomUUID();
  const academicEmployeeId = randomUUID();
  
  await db.insert(account).values({
    id: academicAccountId,
    username: "academic",
    pwdHash,
    email: "academic@quickuni.edu.vn",
    type: "employee",
    status: "active"
  });
  await db.insert(userSystemRole).values({ userId: academicAccountId, systemRole: roles.academic_office });
  await db.insert(profile).values({
    id: academicProfileId,
    accountId: academicAccountId,
    schemaId: employeeSchemaId,
    fullname: "Phạm Minh Hải",
    gender: "male",
    dob: "1985-04-12",
    nationalId: "001085002934",
    dynamicData: { personal_email: "haipm@gmail.com", phone: "0912345678" }
  });
  await db.insert(employee).values({
    id: academicEmployeeId,
    profileId: academicProfileId,
    code: "CB00001"
  });

  // Assign to AAO Department (Phòng Đào tạo) - Academic Staff acts as Trưởng phòng Đào tạo (Department Head)
  await db.insert(departmentEmployment).values({
    employeeId: academicEmployeeId,
    departmentId: aaoDept.id,
    assignDate: "2020-09-01",
    roleCode: "DEPT_HEAD",
    roleName: "Trưởng phòng Đào tạo"
  });

  // 3. Teachers & Departments Mapping
  const teachersData = [
    // FITI
    { fullname: "Nguyễn Văn An", gender: "male" as const, dob: "1978-08-15", code: "GV00001", deptCode: "FITI", email: "an.nv@quickuni.edu.vn" },
    { fullname: "Trần Thị Bình", gender: "female" as const, dob: "1983-05-20", code: "GV00002", deptCode: "FITI", email: "binh.tt@quickuni.edu.vn" },
    // FET
    { fullname: "Lê Hoàng Long", gender: "male" as const, dob: "1980-11-03", code: "GV00003", deptCode: "FET", email: "long.lh@quickuni.edu.vn" },
    { fullname: "Phạm Thanh Sơn", gender: "male" as const, dob: "1982-01-28", code: "GV00004", deptCode: "FET", email: "son.pt@quickuni.edu.vn" },
    // FBA
    { fullname: "Nguyễn Thị Mai", gender: "female" as const, dob: "1985-07-19", code: "GV00005", deptCode: "FBA", email: "mai.nt@quickuni.edu.vn" },
    { fullname: "Phan Anh Tuấn", gender: "male" as const, dob: "1975-03-14", code: "GV00006", deptCode: "FBA", email: "tuan.pa@quickuni.edu.vn" },
    // FFL
    { fullname: "Vũ Thu Hương", gender: "female" as const, dob: "1988-09-25", code: "GV00007", deptCode: "FFL", email: "huong.vt@quickuni.edu.vn" },
    { fullname: "Nguyễn Hoàng Nam", gender: "male" as const, dob: "1981-12-10", code: "GV00008", deptCode: "FFL", email: "nam.nh@quickuni.edu.vn" }
  ];

  const teachersList: any[] = [];

  for (const t of teachersData) {
    const accId = randomUUID();
    const profId = randomUUID();
    const empId = randomUUID();

    await db.insert(account).values({
      id: accId,
      username: t.email.split("@")[0],
      pwdHash,
      email: t.email,
      type: "employee",
      status: "active"
    });
    await db.insert(userSystemRole).values({ userId: accId, systemRole: roles.teacher });
    await db.insert(profile).values({
      id: profId,
      accountId: accId,
      schemaId: employeeSchemaId,
      fullname: t.fullname,
      gender: t.gender,
      dob: t.dob,
      nationalId: `0010${Math.floor(10000000 + Math.random() * 90000000)}`,
      dynamicData: { personal_email: `${accId.substring(0, 5)}@gmail.com`, phone: `09${Math.floor(10000000 + Math.random() * 90000000)}` }
    });
    const [empRecord] = await db.insert(employee).values({
      id: empId,
      profileId: profId,
      code: t.code
    }).returning();

    teachersList.push(empRecord);

    // Assign to Department
    const dept = departments.find(d => d.code === t.deptCode)!;
    
    // Assign Department Head roles for realistic setup
    let roleCode = "TEACHER";
    let roleName = "Giảng viên";
    if (t.code === "GV00001") {
      roleCode = "DEPT_HEAD";
      roleName = "Trưởng khoa CNTT";
    } else if (t.code === "GV00003") {
      roleCode = "DEPT_HEAD";
      roleName = "Trưởng khoa ĐTVT";
    } else if (t.code === "GV00005") {
      roleCode = "DEPT_HEAD";
      roleName = "Trưởng khoa QTKD";
    } else if (t.code === "GV00007") {
      roleCode = "DEPT_HEAD";
      roleName = "Trưởng khoa Ngoại ngữ";
    }

    await db.insert(departmentEmployment).values({
      employeeId: empId,
      departmentId: dept.id,
      assignDate: "2021-09-01",
      roleCode,
      roleName
    });
  }

  // 4. Main Classes (Administrative cohorts)
  const fitiCNTT = majors.find(m => m.code === "CNTT")!;
  const fitiATTT = majors.find(m => m.code === "ATTT")!;
  const fbaQTKD = majors.find(m => m.code === "QTKD")!;
  const fflNNA = majors.find(m => m.code === "NNA")!;

  const mainClassesData = [
    { code: "21CNTT1", teacherId: teachersList[0].id, majorId: fitiCNTT.id, academicYear: 2021 },
    { code: "21ATTT1", teacherId: teachersList[1].id, majorId: fitiATTT.id, academicYear: 2021 },
    { code: "22QTKD1", teacherId: teachersList[4].id, majorId: fbaQTKD.id, academicYear: 2022 },
    { code: "22NNA1", teacherId: teachersList[6].id, majorId: fflNNA.id, academicYear: 2022 },
  ];

  const mainClassesList: any[] = [];
  for (const mc of mainClassesData) {
    const [mcRecord] = await db.insert(mainClass).values({
      id: randomUUID(),
      code: mc.code,
      teacher: mc.teacherId,
      typeId: eduType.id,
      majorId: mc.majorId,
      academicYear: mc.academicYear,
    }).returning();
    mainClassesList.push(mcRecord);
  }

  // 5. Students Seeding (24 profiles, 6 per class)
  const studentsNames = [
    // 21CNTT1
    "Nguyễn Minh Triết", "Lê Thị Thu Thảo", "Trần Hoàng Nam", "Phạm Quốc Anh", "Vũ Huy Hoàng", "Đặng Minh Quân",
    // 21ATTT1
    "Hoàng Bích Phương", "Đỗ Tuấn Kiệt", "Bùi Thế Anh", "Phùng Khánh Linh", "Nguyễn Tiến Đạt", "Lê Tuấn Tú",
    // 22QTKD1
    "Trần Ngọc Khánh", "Nguyễn Thu Hà", "Phạm Minh Hằng", "Nguyễn Đức Mạnh", "Lê Gia Huy", "Vũ Mai Phương",
    // 22NNA1
    "Nguyễn Hải Yến", "Trần Đăng Khoa", "Lâm Mỹ Tâm", "Phan Thanh Hằng", "Nguyễn Trường Giang", "Vương Quốc Bảo"
  ];

  const studentList: any[] = [];

  for (let i = 0; i < studentsNames.length; i++) {
    const classIndex = Math.floor(i / 6);
    const isMonitor = (i % 6) === 0; // The first student in each group is Class Monitor

    const accId = randomUUID();
    const profId = randomUUID();
    const studId = randomUUID();
    const name = studentsNames[i];
    const username = `sv${210000 + i}`;
    const email = `${username}@quickuni.edu.vn`;

    await db.insert(account).values({
      id: accId,
      username,
      pwdHash,
      email,
      type: "student",
      status: "active"
    });
    await db.insert(userSystemRole).values({ userId: accId, systemRole: roles.student });
    await db.insert(profile).values({
      id: profId,
      accountId: accId,
      schemaId: studentSchemaId,
      fullname: name,
      gender: i % 2 === 0 ? "male" : "female",
      dob: classIndex < 2 ? "2003-05-12" : "2004-09-18",
      nationalId: `00120300${1000 + i}`,
      dynamicData: { personal_email: `${username}@gmail.com`, phone: `0987${100000 + i}` }
    });
    const [studRecord] = await db.insert(student).values({
      id: studId,
      profileId: profId,
      code: username.toUpperCase()
    }).returning();

    studentList.push(studRecord);

    // Assign to Main Class
    const targetClass = mainClassesList[classIndex];
    await db.insert(mainClassMember).values({
      studentId: studId,
      classId: targetClass.id,
      roleId: isMonitor ? 1 : 3 // 1: Monitor, 3: Member
    });
  }

  console.log(`✅ People seeded. Admin, 1 Academic Staff, ${teachersList.length} Teachers, ${studentList.length} Students across ${mainClassesList.length} Cohorts.`);
  return { teachersList, studentList };
};
