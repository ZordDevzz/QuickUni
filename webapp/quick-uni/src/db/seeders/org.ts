import { db } from "../index";
import { department, major, departmentPosition } from "../schema";
import { building, room } from "../schema";
import { randomUUID } from "crypto";

export const seedOrg = async () => {
  console.log("🏢 Seeding organization data...");

  // 1. Departments
  const deptsData = [
    { name: "Khoa Công nghệ thông tin", code: "FITI", des: "Faculty of Information Technology" },
    { name: "Khoa Điện tử viễn thông", code: "FET", des: "Faculty of Electronics and Telecommunications" },
    { name: "Khoa Kinh tế & Quản trị kinh doanh", code: "FBA", des: "Faculty of Business Administration" },
    { name: "Khoa Ngoại ngữ", code: "FFL", des: "Faculty of Foreign Languages" },
    { name: "Phòng Đào tạo", code: "AAO", des: "Academic Affairs Office" },
    { name: "Phòng Công tác sinh viên", code: "DSA", des: "Department of Student Affairs" }
  ];

  const depts = deptsData.map((d) => ({
    id: randomUUID(),
    name: d.name,
    code: d.code,
    des: d.des,
  }));
  const insertedDepts = await db.insert(department).values(depts).returning();

  // 1.1 Department Positions Seeding
  const positionsToSeed: any[] = [];
  
  const academicDefaults = [
    { code: "TRUONG_KHOA", name: "Trưởng khoa", des: "Điều hành và quản lý chung toàn khoa" },
    { code: "PHO_KHOA", name: "Phó Trưởng khoa", des: "Hỗ trợ Trưởng khoa quản lý học thuật/khảo thí" },
    { code: "TRUONG_BO_MON", name: "Trưởng bộ môn", des: "Quản lý tổ chuyên môn học phần" },
    { code: "GIANG_VIEN", name: "Giảng viên", des: "Công tác giảng dạy và nghiên cứu khoa học" },
    { code: "TRO_GIANG", name: "Trợ giảng", des: "Hỗ trợ giảng dạy, chấm bài" },
    { code: "GIAO_VU", name: "Giáo vụ khoa", des: "Quản lý hồ sơ học tập và thời khóa biểu khoa" },
    { code: "NHAN_VIEN", name: "Nhân viên văn phòng", des: "Công tác hành chính hỗ trợ tại văn phòng khoa" },
  ];
  
  const adminDefaults = [
    { code: "TRUONG_PHONG", name: "Trưởng phòng", des: "Chỉ đạo, quản lý và điều hành các hoạt động của phòng" },
    { code: "PHO_PHONG", name: "Phó Trưởng phòng", des: "Phụ trách các mảng công việc chuyên biệt theo phân công" },
    { code: "CHUYEN_VIEN", name: "Chuyên viên", des: "Nghiên cứu, tham mưu và thực thi các nghiệp vụ chuyên môn" },
    { code: "NHAN_VIEN", name: "Nhân viên", des: "Thực hiện các công việc văn thư, hỗ trợ hành chính" },
  ];

  for (const dept of insertedDepts) {
    const isAcademic = dept.name?.toLowerCase().includes("khoa") || 
                       dept.code?.toLowerCase().startsWith("k") || 
                       dept.name?.toLowerCase().includes("faculty") || 
                       dept.name?.toLowerCase().includes("bộ môn") || 
                       dept.name?.toLowerCase().includes("subject") ||
                       ["FITI", "FET", "FBA", "FFL"].includes(dept.code || "");
    const defaults = isAcademic ? academicDefaults : adminDefaults;
    
    for (const pos of defaults) {
      positionsToSeed.push({
        id: randomUUID(),
        departmentId: dept.id,
        code: pos.code,
        name: pos.name,
        des: pos.des,
      });
    }
  }

  await db.insert(departmentPosition).values(positionsToSeed);
  console.log(`✅ Seeded ${positionsToSeed.length} default department positions.`);

  // 2. Majors
  const fitiDept = insertedDepts.find(d => d.code === "FITI")!;
  const fetDept = insertedDepts.find(d => d.code === "FET")!;
  const fbaDept = insertedDepts.find(d => d.code === "FBA")!;
  const fflDept = insertedDepts.find(d => d.code === "FFL")!;

  const majorsData = [
    { departmentId: fitiDept.id, code: "CNTT", des: "Chuyên ngành Công nghệ thông tin" },
    { departmentId: fitiDept.id, code: "ATTT", des: "Chuyên ngành An toàn thông tin" },
    { departmentId: fetDept.id, code: "DTVT", des: "Chuyên ngành Điện tử viễn thông" },
    { departmentId: fbaDept.id, code: "QTKD", des: "Chuyên ngành Quản trị kinh doanh" },
    { departmentId: fflDept.id, code: "NNA", des: "Chuyên ngành Ngôn ngữ Anh" },
  ];

  const majors = majorsData.map((m) => ({
    id: randomUUID(),
    departmentId: m.departmentId,
    code: m.code,
    des: m.des,
  }));
  const insertedMajors = await db.insert(major).values(majors).returning();

  // 3. Buildings
  const buildingsData = [
    { code: "A", name: "Tòa nhà A", des: "Khu giảng đường hành chính lý thuyết" },
    { code: "B", name: "Tòa nhà B", des: "Khu thực hành máy tính và phòng thí nghiệm" },
    { code: "C", name: "Tòa nhà C", des: "Khu giảng đường đa năng" }
  ];
  const buildings = buildingsData.map(b => ({
    code: b.code,
    name: b.name,
    des: b.des
  }));
  const insertedBuildings = await db.insert(building).values(buildings).returning();

  // 4. Rooms
  const bldA = insertedBuildings.find(b => b.code === "A")!;
  const bldB = insertedBuildings.find(b => b.code === "B")!;
  const bldC = insertedBuildings.find(b => b.code === "C")!;

  const roomsData = [
    { code: "A-101", buildingId: bldA.id, capacity: 80, type: "Lecture Hall" },
    { code: "A-102", buildingId: bldA.id, capacity: 80, type: "Lecture Hall" },
    { code: "A-201", buildingId: bldA.id, capacity: 40, type: "Classroom" },
    { code: "B-101", buildingId: bldB.id, capacity: 30, type: "Lab" },
    { code: "B-102", buildingId: bldB.id, capacity: 30, type: "Lab" },
    { code: "C-101", buildingId: bldC.id, capacity: 40, type: "Classroom" },
    { code: "C-102", buildingId: bldC.id, capacity: 40, type: "Classroom" },
  ];
  const rooms = roomsData.map(r => ({
    code: r.code,
    buildingId: r.buildingId,
    capacity: r.capacity,
    type: r.type
  }));
  const insertedRooms = await db.insert(room).values(rooms).returning();

  console.log("✅ Organization data seeded.");
  return { departments: insertedDepts, majors: insertedMajors, rooms: insertedRooms };
};
