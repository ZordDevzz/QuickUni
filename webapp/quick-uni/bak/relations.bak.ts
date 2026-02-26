import { relations } from "drizzle-orm/relations";
import {
  employee,
  gradeAudit,
  grade,
  account,
  notificationRecipient,
  notification,
  featureFlagAudit,
  featureFlag,
  assignment,
  enrollment,
  gradeType,
  courseClass,
  enrollStatus,
  student,
  userDeviceToken,
  semester,
  registrationPeriod,
  knowledgeBlock,
  chatGroup,
  groupRole,
  scholarshipPolicy,
  studentScholarship,
  invoiceDetail,
  invoice,
  transaction,
  courseClassType,
  subject,
  major,
  curriculum,
  tuitionFeeConfig,
  schedule,
  room,
  scheduleStatus,
  scheduleType,
  systemAuditLog,
  chatGroupMember,
  notificationTemplate,
  profile,
  profileSchema,
  message,
  building,
  courseMaterial,
  systemSetting,
  department,
  educationType,
  mainClass,
  groupAuthority,
  groupRoleAuthority,
  messageRead,
  userSystemRole,
  systemRole,
  systemAuthority,
  systemRoleAuthority,
  memberRole,
  profileField,
  profileSchemaField,
  subjectPrerequisite,
  systemBroadcastRead,
  systemBroadcast,
  mainClassMember,
  classRole,
  userNotificationSetting,
  curriculumSubject,
  departmentEmployment,
  attendanceStatus,
} from "./schema.bak";

export const gradeAuditRelations = relations(gradeAudit, ({ one }) => ({
  employee: one(employee, {
    fields: [gradeAudit.changeBy],
    references: [employee.id],
  }),
  grade: one(grade, {
    fields: [gradeAudit.gradeId],
    references: [grade.id],
  }),
}));

export const employeeRelations = relations(employee, ({ one, many }) => ({
  gradeAudits: many(gradeAudit),
  courseClasses: many(courseClass),
  schedules: many(schedule),
  courseMaterials: many(courseMaterial),
  profile: one(profile, {
    fields: [employee.profileId],
    references: [profile.id],
  }),
  mainClasses: many(mainClass),
  departmentEmployments: many(departmentEmployment),
}));

export const gradeRelations = relations(grade, ({ one, many }) => ({
  gradeAudits: many(gradeAudit),
  assignment: one(assignment, {
    fields: [grade.assignmentId],
    references: [assignment.id],
  }),
  enrollment: one(enrollment, {
    fields: [grade.enrollmentId],
    references: [enrollment.id],
  }),
  gradeType: one(gradeType, {
    fields: [grade.typeId],
    references: [gradeType.id],
  }),
}));

export const notificationRecipientRelations = relations(
  notificationRecipient,
  ({ one }) => ({
    account: one(account, {
      fields: [notificationRecipient.recipientId],
      references: [account.id],
    }),
    notification: one(notification, {
      fields: [notificationRecipient.notificationId],
      references: [notification.id],
    }),
  }),
);

export const accountRelations = relations(account, ({ many }) => ({
  notificationRecipients: many(notificationRecipient),
  featureFlagAudits: many(featureFlagAudit),
  featureFlags: many(featureFlag),
  userDeviceTokens: many(userDeviceToken),
  systemAuditLogs: many(systemAuditLog),
  chatGroupMembers: many(chatGroupMember),
  notifications: many(notification),
  profiles: many(profile),
  messages: many(message),
  chatGroups: many(chatGroup),
  systemSettings: many(systemSetting),
  messageReads: many(messageRead),
  userSystemRoles: many(userSystemRole),
  systemBroadcastReads: many(systemBroadcastRead),
  userNotificationSettings: many(userNotificationSetting),
}));

export const notificationRelations = relations(
  notification,
  ({ one, many }) => ({
    notificationRecipients: many(notificationRecipient),
    account: one(account, {
      fields: [notification.actorId],
      references: [account.id],
    }),
    notificationTemplate: one(notificationTemplate, {
      fields: [notification.templateId],
      references: [notificationTemplate.id],
    }),
  }),
);

export const featureFlagAuditRelations = relations(
  featureFlagAudit,
  ({ one }) => ({
    account: one(account, {
      fields: [featureFlagAudit.changeBy],
      references: [account.id],
    }),
    featureFlag: one(featureFlag, {
      fields: [featureFlagAudit.flagId],
      references: [featureFlag.id],
    }),
  }),
);

export const featureFlagRelations = relations(featureFlag, ({ one, many }) => ({
  featureFlagAudits: many(featureFlagAudit),
  account: one(account, {
    fields: [featureFlag.updateBy],
    references: [account.id],
  }),
}));

export const assignmentRelations = relations(assignment, ({ one, many }) => ({
  grades: many(grade),
  courseClass: one(courseClass, {
    fields: [assignment.courseClassId],
    references: [courseClass.id],
  }),
}));

export const enrollmentRelations = relations(enrollment, ({ one, many }) => ({
  grades: many(grade),
  courseClass: one(courseClass, {
    fields: [enrollment.courseClassId],
    references: [courseClass.id],
  }),
  enrollStatus: one(enrollStatus, {
    fields: [enrollment.status],
    references: [enrollStatus.id],
  }),
  student: one(student, {
    fields: [enrollment.studentId],
    references: [student.id],
  }),
  invoiceDetails: many(invoiceDetail),
  attendanceStatuses: many(attendanceStatus),
}));

export const gradeTypeRelations = relations(gradeType, ({ many }) => ({
  grades: many(grade),
}));

export const courseClassRelations = relations(courseClass, ({ one, many }) => ({
  enrollments: many(enrollment),
  courseClassType: one(courseClassType, {
    fields: [courseClass.type],
    references: [courseClassType.id],
  }),
  employee: one(employee, {
    fields: [courseClass.teacherId],
    references: [employee.id],
  }),
  semester: one(semester, {
    fields: [courseClass.semesterId],
    references: [semester.id],
  }),
  subject: one(subject, {
    fields: [courseClass.subjectId],
    references: [subject.id],
  }),
  assignments: many(assignment),
  schedules: many(schedule),
  courseMaterials: many(courseMaterial),
}));

export const enrollStatusRelations = relations(enrollStatus, ({ many }) => ({
  enrollments: many(enrollment),
}));

export const studentRelations = relations(student, ({ one, many }) => ({
  enrollments: many(enrollment),
  studentScholarships: many(studentScholarship),
  profile: one(profile, {
    fields: [student.profileId],
    references: [profile.id],
  }),
  invoices: many(invoice),
  mainClassMembers: many(mainClassMember),
}));

export const userDeviceTokenRelations = relations(
  userDeviceToken,
  ({ one }) => ({
    account: one(account, {
      fields: [userDeviceToken.userId],
      references: [account.id],
    }),
  }),
);

export const registrationPeriodRelations = relations(
  registrationPeriod,
  ({ one }) => ({
    semester: one(semester, {
      fields: [registrationPeriod.semesterId],
      references: [semester.id],
    }),
  }),
);

export const semesterRelations = relations(semester, ({ many }) => ({
  registrationPeriods: many(registrationPeriod),
  studentScholarships: many(studentScholarship),
  courseClasses: many(courseClass),
  invoices: many(invoice),
}));

export const knowledgeBlockRelations = relations(
  knowledgeBlock,
  ({ one, many }) => ({
    knowledgeBlock: one(knowledgeBlock, {
      fields: [knowledgeBlock.parentId],
      references: [knowledgeBlock.id],
      relationName: "knowledgeBlock_parentId_knowledgeBlock_id",
    }),
    knowledgeBlocks: many(knowledgeBlock, {
      relationName: "knowledgeBlock_parentId_knowledgeBlock_id",
    }),
    curriculumSubjects: many(curriculumSubject),
  }),
);

export const groupRoleRelations = relations(groupRole, ({ one, many }) => ({
  chatGroup: one(chatGroup, {
    fields: [groupRole.groupId],
    references: [chatGroup.id],
  }),
  groupRoleAuthorities: many(groupRoleAuthority),
  memberRoles: many(memberRole),
}));

export const chatGroupRelations = relations(chatGroup, ({ one, many }) => ({
  groupRoles: many(groupRole),
  chatGroupMembers: many(chatGroupMember),
  messages: many(message),
  account: one(account, {
    fields: [chatGroup.head],
    references: [account.id],
  }),
}));

export const studentScholarshipRelations = relations(
  studentScholarship,
  ({ one }) => ({
    scholarshipPolicy: one(scholarshipPolicy, {
      fields: [studentScholarship.policyId],
      references: [scholarshipPolicy.id],
    }),
    semester: one(semester, {
      fields: [studentScholarship.semesterId],
      references: [semester.id],
    }),
    student: one(student, {
      fields: [studentScholarship.studentId],
      references: [student.id],
    }),
  }),
);

export const scholarshipPolicyRelations = relations(
  scholarshipPolicy,
  ({ many }) => ({
    studentScholarships: many(studentScholarship),
  }),
);

export const invoiceDetailRelations = relations(invoiceDetail, ({ one }) => ({
  enrollment: one(enrollment, {
    fields: [invoiceDetail.enrollmentId],
    references: [enrollment.id],
  }),
  invoice: one(invoice, {
    fields: [invoiceDetail.invoiceId],
    references: [invoice.id],
  }),
}));

export const invoiceRelations = relations(invoice, ({ one, many }) => ({
  invoiceDetails: many(invoiceDetail),
  transactions: many(transaction),
  semester: one(semester, {
    fields: [invoice.semesterId],
    references: [semester.id],
  }),
  student: one(student, {
    fields: [invoice.studentId],
    references: [student.id],
  }),
}));

export const transactionRelations = relations(transaction, ({ one }) => ({
  invoice: one(invoice, {
    fields: [transaction.invoiceId],
    references: [invoice.id],
  }),
}));

export const courseClassTypeRelations = relations(
  courseClassType,
  ({ many }) => ({
    courseClasses: many(courseClass),
  }),
);

export const subjectRelations = relations(subject, ({ many }) => ({
  courseClasses: many(courseClass),
  subjectPrerequisites_prerequisiteId: many(subjectPrerequisite, {
    relationName: "subjectPrerequisite_prerequisiteId_subject_id",
  }),
  subjectPrerequisites_subjectId: many(subjectPrerequisite, {
    relationName: "subjectPrerequisite_subjectId_subject_id",
  }),
  curriculumSubjects: many(curriculumSubject),
}));

export const curriculumRelations = relations(curriculum, ({ one, many }) => ({
  major: one(major, {
    fields: [curriculum.majorId],
    references: [major.id],
  }),
  curriculumSubjects: many(curriculumSubject),
}));

export const majorRelations = relations(major, ({ one, many }) => ({
  curricula: many(curriculum),
  tuitionFeeConfigs: many(tuitionFeeConfig),
  department: one(department, {
    fields: [major.departmentId],
    references: [department.id],
  }),
  mainClasses: many(mainClass),
}));

export const tuitionFeeConfigRelations = relations(
  tuitionFeeConfig,
  ({ one }) => ({
    major: one(major, {
      fields: [tuitionFeeConfig.majorId],
      references: [major.id],
    }),
  }),
);

export const scheduleRelations = relations(schedule, ({ one, many }) => ({
  courseClass: one(courseClass, {
    fields: [schedule.courseClassId],
    references: [courseClass.id],
  }),
  employee: one(employee, {
    fields: [schedule.conductorId],
    references: [employee.id],
  }),
  room: one(room, {
    fields: [schedule.roomId],
    references: [room.id],
  }),
  scheduleStatus: one(scheduleStatus, {
    fields: [schedule.statusId],
    references: [scheduleStatus.id],
  }),
  scheduleType: one(scheduleType, {
    fields: [schedule.type],
    references: [scheduleType.id],
  }),
  attendanceStatuses: many(attendanceStatus),
}));

export const roomRelations = relations(room, ({ one, many }) => ({
  schedules: many(schedule),
  building: one(building, {
    fields: [room.buildingId],
    references: [building.id],
  }),
}));

export const scheduleStatusRelations = relations(
  scheduleStatus,
  ({ many }) => ({
    schedules: many(schedule),
  }),
);

export const scheduleTypeRelations = relations(scheduleType, ({ many }) => ({
  schedules: many(schedule),
}));

export const systemAuditLogRelations = relations(systemAuditLog, ({ one }) => ({
  account: one(account, {
    fields: [systemAuditLog.actorId],
    references: [account.id],
  }),
}));

export const chatGroupMemberRelations = relations(
  chatGroupMember,
  ({ one, many }) => ({
    chatGroup: one(chatGroup, {
      fields: [chatGroupMember.groupId],
      references: [chatGroup.id],
    }),
    account: one(account, {
      fields: [chatGroupMember.uid],
      references: [account.id],
    }),
    memberRoles: many(memberRole),
  }),
);

export const notificationTemplateRelations = relations(
  notificationTemplate,
  ({ many }) => ({
    notifications: many(notification),
  }),
);

export const profileRelations = relations(profile, ({ one, many }) => ({
  account: one(account, {
    fields: [profile.accountId],
    references: [account.id],
  }),
  profileSchema: one(profileSchema, {
    fields: [profile.schemaId],
    references: [profileSchema.id],
  }),
  employees: many(employee),
  students: many(student),
}));

export const profileSchemaRelations = relations(profileSchema, ({ many }) => ({
  profiles: many(profile),
  profileSchemaFields: many(profileSchemaField),
}));

export const messageRelations = relations(message, ({ one, many }) => ({
  account: one(account, {
    fields: [message.sender],
    references: [account.id],
  }),
  chatGroup: one(chatGroup, {
    fields: [message.groupId],
    references: [chatGroup.id],
  }),
  message: one(message, {
    fields: [message.replyToId],
    references: [message.id],
    relationName: "message_replyToId_message_id",
  }),
  messages: many(message, {
    relationName: "message_replyToId_message_id",
  }),
  messageReads: many(messageRead),
}));

export const buildingRelations = relations(building, ({ many }) => ({
  rooms: many(room),
}));

export const courseMaterialRelations = relations(courseMaterial, ({ one }) => ({
  courseClass: one(courseClass, {
    fields: [courseMaterial.courseClassId],
    references: [courseClass.id],
  }),
  employee: one(employee, {
    fields: [courseMaterial.uploadBy],
    references: [employee.id],
  }),
}));

export const systemSettingRelations = relations(systemSetting, ({ one }) => ({
  account: one(account, {
    fields: [systemSetting.updateBy],
    references: [account.id],
  }),
}));

export const departmentRelations = relations(department, ({ many }) => ({
  majors: many(major),
  departmentEmployments: many(departmentEmployment),
}));

export const mainClassRelations = relations(mainClass, ({ one, many }) => ({
  educationType: one(educationType, {
    fields: [mainClass.typeId],
    references: [educationType.id],
  }),
  employee: one(employee, {
    fields: [mainClass.teacher],
    references: [employee.id],
  }),
  major: one(major, {
    fields: [mainClass.majorId],
    references: [major.id],
  }),
  mainClassMembers: many(mainClassMember),
}));

export const educationTypeRelations = relations(educationType, ({ many }) => ({
  mainClasses: many(mainClass),
}));

export const groupRoleAuthorityRelations = relations(
  groupRoleAuthority,
  ({ one }) => ({
    groupAuthority: one(groupAuthority, {
      fields: [groupRoleAuthority.authorityId],
      references: [groupAuthority.id],
    }),
    groupRole: one(groupRole, {
      fields: [groupRoleAuthority.roleId],
      references: [groupRole.id],
    }),
  }),
);

export const groupAuthorityRelations = relations(
  groupAuthority,
  ({ many }) => ({
    groupRoleAuthorities: many(groupRoleAuthority),
  }),
);

export const messageReadRelations = relations(messageRead, ({ one }) => ({
  account: one(account, {
    fields: [messageRead.recipientId],
    references: [account.id],
  }),
  message: one(message, {
    fields: [messageRead.messageId],
    references: [message.id],
  }),
}));

export const userSystemRoleRelations = relations(userSystemRole, ({ one }) => ({
  account: one(account, {
    fields: [userSystemRole.userId],
    references: [account.id],
  }),
  systemRole: one(systemRole, {
    fields: [userSystemRole.systemRole],
    references: [systemRole.id],
  }),
}));

export const systemRoleRelations = relations(systemRole, ({ many }) => ({
  userSystemRoles: many(userSystemRole),
  systemRoleAuthorities: many(systemRoleAuthority),
}));

export const systemRoleAuthorityRelations = relations(
  systemRoleAuthority,
  ({ one }) => ({
    systemAuthority: one(systemAuthority, {
      fields: [systemRoleAuthority.authorityId],
      references: [systemAuthority.id],
    }),
    systemRole: one(systemRole, {
      fields: [systemRoleAuthority.roleId],
      references: [systemRole.id],
    }),
  }),
);

export const systemAuthorityRelations = relations(
  systemAuthority,
  ({ many }) => ({
    systemRoleAuthorities: many(systemRoleAuthority),
  }),
);

export const memberRoleRelations = relations(memberRole, ({ one }) => ({
  chatGroupMember: one(chatGroupMember, {
    fields: [memberRole.memberId],
    references: [chatGroupMember.id],
  }),
  groupRole: one(groupRole, {
    fields: [memberRole.roleId],
    references: [groupRole.id],
  }),
}));

export const profileSchemaFieldRelations = relations(
  profileSchemaField,
  ({ one }) => ({
    profileField: one(profileField, {
      fields: [profileSchemaField.fieldId],
      references: [profileField.id],
    }),
    profileSchema: one(profileSchema, {
      fields: [profileSchemaField.schemaId],
      references: [profileSchema.id],
    }),
  }),
);

export const profileFieldRelations = relations(profileField, ({ many }) => ({
  profileSchemaFields: many(profileSchemaField),
}));

export const subjectPrerequisiteRelations = relations(
  subjectPrerequisite,
  ({ one }) => ({
    subject_prerequisiteId: one(subject, {
      fields: [subjectPrerequisite.prerequisiteId],
      references: [subject.id],
      relationName: "subjectPrerequisite_prerequisiteId_subject_id",
    }),
    subject_subjectId: one(subject, {
      fields: [subjectPrerequisite.subjectId],
      references: [subject.id],
      relationName: "subjectPrerequisite_subjectId_subject_id",
    }),
  }),
);

export const systemBroadcastReadRelations = relations(
  systemBroadcastRead,
  ({ one }) => ({
    account: one(account, {
      fields: [systemBroadcastRead.userId],
      references: [account.id],
    }),
    systemBroadcast: one(systemBroadcast, {
      fields: [systemBroadcastRead.broadcastId],
      references: [systemBroadcast.id],
    }),
  }),
);

export const systemBroadcastRelations = relations(
  systemBroadcast,
  ({ many }) => ({
    systemBroadcastReads: many(systemBroadcastRead),
  }),
);

export const mainClassMemberRelations = relations(
  mainClassMember,
  ({ one }) => ({
    mainClass: one(mainClass, {
      fields: [mainClassMember.classId],
      references: [mainClass.id],
    }),
    classRole: one(classRole, {
      fields: [mainClassMember.roleId],
      references: [classRole.id],
    }),
    student: one(student, {
      fields: [mainClassMember.studentId],
      references: [student.id],
    }),
  }),
);

export const classRoleRelations = relations(classRole, ({ many }) => ({
  mainClassMembers: many(mainClassMember),
}));

export const userNotificationSettingRelations = relations(
  userNotificationSetting,
  ({ one }) => ({
    account: one(account, {
      fields: [userNotificationSetting.userId],
      references: [account.id],
    }),
  }),
);

export const curriculumSubjectRelations = relations(
  curriculumSubject,
  ({ one }) => ({
    curriculum: one(curriculum, {
      fields: [curriculumSubject.curriculumId],
      references: [curriculum.id],
    }),
    knowledgeBlock: one(knowledgeBlock, {
      fields: [curriculumSubject.knowledgeBlockId],
      references: [knowledgeBlock.id],
    }),
    subject: one(subject, {
      fields: [curriculumSubject.subjectId],
      references: [subject.id],
    }),
  }),
);

export const departmentEmploymentRelations = relations(
  departmentEmployment,
  ({ one }) => ({
    department: one(department, {
      fields: [departmentEmployment.departmentId],
      references: [department.id],
    }),
    employee: one(employee, {
      fields: [departmentEmployment.employeeId],
      references: [employee.id],
    }),
  }),
);

export const attendanceStatusRelations = relations(
  attendanceStatus,
  ({ one }) => ({
    enrollment: one(enrollment, {
      fields: [attendanceStatus.enrollId],
      references: [enrollment.id],
    }),
    schedule: one(schedule, {
      fields: [attendanceStatus.scheduleId],
      references: [schedule.id],
    }),
  }),
);
