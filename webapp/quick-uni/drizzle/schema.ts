import { pgTable, bigint, boolean, varchar, foreignKey, uuid, numeric, timestamp, index, bigserial, text, uniqueIndex, unique, smallint, serial, jsonb, smallserial, json, date, time, integer, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const enumAccountType = pgEnum("enum_account_type", ['student', 'employee', 'tech', 'dev'])
export const enumAttendanceState = pgEnum("enum_attendance_state", ['present', 'absent', 'late', 'excused'])
export const enumDiscountType = pgEnum("enum_discount_type", ['percentage', 'fixed_amount'])
export const enumGender = pgEnum("enum_gender", ['male', 'female', 'others'])
export const enumMsgState = pgEnum("enum_msg_state", ['archived', 'deleted', 'normal'])
export const enumPaymentStatus = pgEnum("enum_payment_status", ['pending', 'paid', 'cancelled', 'refunded'])
export const notificationChannel = pgEnum("notification_channel", ['in_app', 'email', 'push', 'sms'])
export const notificationStatus = pgEnum("notification_status", ['queued', 'sent', 'failed', 'read', 'unread'])
export const notificationType = pgEnum("notification_type", ['system', 'academic', 'finance', 'social'])


export const systemRole = pgTable("system_role", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	isDefaultRole: boolean("is_default_role"),
	name: varchar({ length: 255 }),
});

export const gradeAudit = pgTable("grade_audit", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	gradeId: bigint("grade_id", { mode: "number" }).notNull(),
	changeBy: uuid("change_by").notNull(),
	oldScore: numeric("old_score", { precision: 5, scale:  2 }).notNull(),
	newScore: numeric("new_score", { precision: 5, scale:  2 }),
	changeAt: timestamp("change_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.changeBy],
			foreignColumns: [employee.id],
			name: "fk_grade_audit_change_by_employee_id"
		}),
	foreignKey({
			columns: [table.gradeId],
			foreignColumns: [grade.id],
			name: "fk_grade_audit_grade_id_grade_id"
		}),
]);

export const notificationRecipient = pgTable("notification_recipient", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	notificationId: uuid("notification_id").notNull(),
	recipientId: uuid("recipient_id").notNull(),
	channel: notificationChannel().notNull(),
	status: notificationStatus().default('unread'),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).notNull(),
	readAt: timestamp("read_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("notification_recipient_idx_notif_feed").using("btree", table.recipientId.asc().nullsLast().op("timestamptz_ops"), table.createAt.asc().nullsLast().op("timestamptz_ops")),
	index("notification_recipient_idx_notif_unread_count").using("btree", table.recipientId.asc().nullsLast().op("enum_ops"), table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.recipientId],
			foreignColumns: [account.id],
			name: "fk_notification_recipient_recipient_id_account_id"
		}),
	foreignKey({
			columns: [table.notificationId],
			foreignColumns: [notification.id],
			name: "fk_notification_recipient_notification_id_notification_id"
		}),
]);

export const featureFlagAudit = pgTable("feature_flag_audit", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	changeBy: uuid("change_by").notNull(),
	flagId: varchar("flag_id", { length: 255 }).notNull(),
	oldEnabled: boolean("old_enabled").notNull(),
	newEnabled: boolean("new_enabled").notNull(),
	changeAt: timestamp("change_at", { withTimezone: true, mode: 'string' }).notNull(),
	reason: text(),
}, (table) => [
	foreignKey({
			columns: [table.changeBy],
			foreignColumns: [account.id],
			name: "fk_feature_flag_audit_change_by_account_id"
		}),
	foreignKey({
			columns: [table.flagId],
			foreignColumns: [featureFlag.id],
			name: "fk_feature_flag_audit_flag_id_feature_flag_id"
		}),
]);

export const grade = pgTable("grade", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	enrollmentId: bigint("enrollment_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	typeId: bigint("type_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	assignmentId: bigint("assignment_id", { mode: "number" }),
	score: numeric({ precision: 5, scale:  2 }).notNull(),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("grade_idx_grade_enrollment_id").using("btree", table.enrollmentId.asc().nullsLast().op("int8_ops")),
	uniqueIndex("grade_idx_grade_unique_entry").using("btree", table.enrollmentId.asc().nullsLast().op("int8_ops"), table.typeId.asc().nullsLast().op("int8_ops"), table.assignmentId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.assignmentId],
			foreignColumns: [assignment.id],
			name: "fk_grade_assignment_id_assignment_id"
		}),
	foreignKey({
			columns: [table.enrollmentId],
			foreignColumns: [enrollment.id],
			name: "fk_grade_enrollment_id_enrollment_id"
		}),
	foreignKey({
			columns: [table.typeId],
			foreignColumns: [gradeType.id],
			name: "fk_grade_type_id_grade_type_id"
		}),
]);

export const courseClassType = pgTable("course_class_type", {
	id: smallint().primaryKey().notNull(),
	code: varchar({ length: 30 }).notNull(),
	name: varchar({ length: 255 }),
	des: text(),
}, (table) => [
	unique("course_class_type_code_key").on(table.code),
]);

export const notificationTemplate = pgTable("notification_template", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 50 }).notNull(),
	titleTemplate: varchar("title_template", { length: 255 }).notNull(),
	bodyTemplate: text("body_template").notNull(),
	type: notificationType().notNull(),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("notification_template_code_key").on(table.code),
]);

export const enrollment = pgTable("enrollment", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	status: smallint(),
	studentId: uuid("student_id").notNull(),
	courseClassId: uuid("course_class_id").notNull(),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	uniqueIndex("enrollment_enrollment_index_0").using("btree", table.studentId.asc().nullsLast().op("uuid_ops"), table.courseClassId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.courseClassId],
			foreignColumns: [courseClass.id],
			name: "fk_enrollment_course_class_id_course_class_id"
		}),
	foreignKey({
			columns: [table.status],
			foreignColumns: [enrollStatus.id],
			name: "fk_enrollment_status_enroll_status_id"
		}),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [student.id],
			name: "fk_enrollment_student_id_student_id"
		}),
]);

export const featureFlag = pgTable("feature_flag", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	enabled: boolean(),
	displayName: varchar("display_name", { length: 255 }),
	version: varchar({ length: 30 }),
	des: text(),
	target: jsonb(),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).notNull(),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
	updateBy: uuid("update_by"),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	status: varchar({ length: 30 }),
}, (table) => [
	foreignKey({
			columns: [table.updateBy],
			foreignColumns: [account.id],
			name: "fk_feature_flag_update_by_account_id"
		}),
]);

export const userDeviceToken = pgTable("user_device_token", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	deviceToken: varchar("device_token", { length: 512 }).notNull(),
	platform: varchar({ length: 20 }),
	lastActiveAt: timestamp("last_active_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	uniqueIndex("user_device_token_idx_user_device_token_user_id_device_token").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.deviceToken.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [account.id],
			name: "fk_user_device_token_user_id_account_id"
		}),
]);

export const educationType = pgTable("education_type", {
	id: smallserial().primaryKey().notNull(),
	code: varchar({ length: 30 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	des: varchar({ length: 512 }),
	length: smallint().notNull(),
});

export const registrationPeriod = pgTable("registration_period", {
	id: serial().primaryKey().notNull(),
	semesterId: smallint("semester_id").notNull(),
	name: varchar({ length: 255 }),
	startAt: timestamp("start_at", { withTimezone: true, mode: 'string' }).notNull(),
	endAt: timestamp("end_at", { withTimezone: true, mode: 'string' }).notNull(),
	isActive: boolean("is_active").default(true),
}, (table) => [
	foreignKey({
			columns: [table.semesterId],
			foreignColumns: [semester.id],
			name: "fk_registration_period_semester_id_semester_id"
		}),
]);

export const scheduleType = pgTable("schedule_type", {
	id: smallint().primaryKey().notNull(),
	code: varchar({ length: 30 }).notNull(),
	name: varchar({ length: 255 }),
	des: text(),
});

export const account = pgTable("account", {
	id: uuid().primaryKey().notNull(),
	username: varchar({ length: 255 }).notNull(),
	pwdHash: varchar("pwd_hash", { length: 255 }).notNull(),
	type: enumAccountType(),
	email: varchar({ length: 255 }),
	phone: varchar({ length: 20 }),
	status: varchar({ length: 20 }).default('active'),
	lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: 'string' }),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("account_idx_acc_usrname").using("btree", table.username.asc().nullsLast().op("text_ops")),
	unique("account_username_key").on(table.username),
	unique("account_email_key").on(table.email),
	unique("account_phone_key").on(table.phone),
]);

export const archive = pgTable("archive", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	origin: varchar({ length: 255 }),
	data: json(),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }),
});

export const knowledgeBlock = pgTable("knowledge_block", {
	id: smallserial().primaryKey().notNull(),
	code: varchar({ length: 30 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	parentId: smallint("parent_id"),
	des: text(),
}, (table) => [
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "fk_knowledge_block_parent_id_knowledge_block_id"
		}),
	unique("knowledge_block_code_key").on(table.code),
]);

export const groupRole = pgTable("group_role", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	name: varchar({ length: 255 }),
	groupId: uuid("group_id"),
	isGroupRole: boolean("is_group_role").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [chatGroup.id],
			name: "fk_group_role_group_id_chat_group_id"
		}),
]);

export const classRole = pgTable("class_role", {
	id: smallserial().primaryKey().notNull(),
	code: varchar({ length: 30 }).notNull(),
	name: varchar({ length: 255 }),
	des: varchar({ length: 255 }),
});

export const building = pgTable("building", {
	id: smallserial().primaryKey().notNull(),
	code: varchar({ length: 30 }).notNull(),
	name: varchar({ length: 255 }),
	des: text(),
}, (table) => [
	unique("building_code_key").on(table.code),
]);

export const studentScholarship = pgTable("student_scholarship", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	studentId: uuid("student_id").notNull(),
	policyId: smallint("policy_id").notNull(),
	semesterId: smallint("semester_id").notNull(),
	isActive: boolean("is_active").default(true),
	grantDate: timestamp("grant_date", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_student_scholarship_student_id_semester_id").using("btree", table.studentId.asc().nullsLast().op("int2_ops"), table.semesterId.asc().nullsLast().op("int2_ops")),
	foreignKey({
			columns: [table.policyId],
			foreignColumns: [scholarshipPolicy.id],
			name: "fk_student_scholarship_policy_id_scholarship_policy_id"
		}),
	foreignKey({
			columns: [table.semesterId],
			foreignColumns: [semester.id],
			name: "fk_student_scholarship_semester_id_semester_id"
		}),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [student.id],
			name: "fk_student_scholarship_student_id_student_id"
		}),
]);

export const invoiceDetail = pgTable("invoice_detail", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	invoiceId: uuid("invoice_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	enrollmentId: bigint("enrollment_id", { mode: "number" }).notNull(),
	creditPrice: numeric("credit_price", { precision: 10, scale:  2 }).notNull(),
	subjectCredits: smallint("subject_credits").notNull(),
	amount: numeric({ precision: 15, scale:  2 }).notNull(),
	note: varchar({ length: 255 }),
}, (table) => [
	foreignKey({
			columns: [table.enrollmentId],
			foreignColumns: [enrollment.id],
			name: "fk_invoice_detail_enrollment_id_enrollment_id"
		}),
	foreignKey({
			columns: [table.invoiceId],
			foreignColumns: [invoice.id],
			name: "fk_invoice_detail_invoice_id_invoice_id"
		}),
	unique("invoice_detail_enrollment_id_key").on(table.enrollmentId),
]);

export const gradeType = pgTable("grade_type", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	code: varchar({ length: 30 }).notNull(),
	weight: smallint().notNull(),
	name: varchar({ length: 255 }),
});

export const groupAuthority = pgTable("group_authority", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
});

export const semester = pgTable("semester", {
	id: smallserial().primaryKey().notNull(),
	code: varchar({ length: 30 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	academicYear: smallint("academic_year").notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	isCurrent: boolean("is_current").default(false),
}, (table) => [
	unique("semester_code_key").on(table.code),
]);

export const profileField = pgTable("profile_field", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	name: varchar({ length: 255 }),
	datatype: varchar({ length: 255 }),
	uiSection: varchar("ui_section", { length: 255 }).notNull(),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).notNull(),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
	label: varchar({ length: 255 }),
	des: text(),
});

export const department = pgTable("department", {
	id: uuid().primaryKey().notNull(),
	code: varchar({ length: 30 }),
	name: varchar({ length: 255 }).notNull(),
	des: varchar({ length: 512 }),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("department_code_key").on(table.code),
]);

export const enrollStatus = pgTable("enroll_status", {
	id: smallint().primaryKey().notNull(),
	code: varchar({ length: 30 }),
	name: varchar({ length: 255 }),
});

export const systemBroadcast = pgTable("system_broadcast", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }),
	body: text(),
	targetRoles: jsonb("target_roles"),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	expireAt: timestamp("expire_at", { withTimezone: true, mode: 'string' }),
});

export const transaction = pgTable("transaction", {
	id: uuid().primaryKey().notNull(),
	invoiceId: uuid("invoice_id").notNull(),
	amount: numeric({ precision: 15, scale:  2 }),
	paymentMethod: varchar("payment_method", { length: 50 }),
	transactionCode: varchar("transaction_code", { length: 255 }),
	payAt: timestamp("pay_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.invoiceId],
			foreignColumns: [invoice.id],
			name: "fk_transaction_invoice_id_invoice_id"
		}),
]);

export const courseClass = pgTable("course_class", {
	id: uuid().primaryKey().notNull(),
	code: varchar({ length: 30 }).notNull(),
	teacherId: uuid("teacher_id").notNull(),
	subjectId: uuid("subject_id").notNull(),
	cap: smallint().default(30).notNull(),
	currentSlot: smallint("current_slot").default(0).notNull(),
	status: varchar({ length: 20 }).default('opened'),
	type: smallint().notNull(),
	semesterId: smallint("semester_id").notNull(),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.type],
			foreignColumns: [courseClassType.id],
			name: "fk_course_class_type_course_class_type_id"
		}),
	foreignKey({
			columns: [table.teacherId],
			foreignColumns: [employee.id],
			name: "fk_course_class_teacher_id_employee_id"
		}),
	foreignKey({
			columns: [table.semesterId],
			foreignColumns: [semester.id],
			name: "fk_course_class_semester_id_semester_id"
		}),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subject.id],
			name: "fk_course_class_subject_id_subject_id"
		}),
	unique("course_class_code_key").on(table.code),
]);

export const assignment = pgTable("assignment", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	title: varchar({ length: 512 }),
	data: jsonb(),
	courseClassId: uuid("course_class_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.courseClassId],
			foreignColumns: [courseClass.id],
			name: "fk_assignment_course_class_id_course_class_id"
		}),
]);

export const curriculum = pgTable("curriculum", {
	id: serial().primaryKey().notNull(),
	majorId: uuid("major_id").notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	academicYear: smallint("academic_year").notNull(),
	totalCredits: smallint("total_credits"),
	des: text(),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.majorId],
			foreignColumns: [major.id],
			name: "fk_curriculum_major_id_major_id"
		}),
	unique("curriculum_code_key").on(table.code),
]);

export const tuitionFeeConfig = pgTable("tuition_fee_config", {
	id: serial().primaryKey().notNull(),
	majorId: uuid("major_id"),
	academicYear: smallint("academic_year").notNull(),
	pricePerCredit: numeric("price_per_credit", { precision: 10, scale:  2 }).notNull(),
	note: text(),
}, (table) => [
	foreignKey({
			columns: [table.majorId],
			foreignColumns: [major.id],
			name: "fk_tuition_fee_config_major_id_major_id"
		}),
]);

export const schedule = pgTable("schedule", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	type: smallint().notNull(),
	courseClassId: uuid("course_class_id").notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
	period: smallint().notNull(),
	mPerPeriod: integer("m_per_period").default(45),
	schDate: date("sch_date").notNull(),
	note: varchar({ length: 512 }),
	statusId: smallint("status_id"),
	conductorId: uuid("conductor_id"),
	roomId: smallint("room_id"),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("schedule_idx_schedule_c_class").using("btree", table.courseClassId.asc().nullsLast().op("uuid_ops")),
	index("schedule_idx_schedule_conductor").using("btree", table.conductorId.asc().nullsLast().op("date_ops"), table.schDate.asc().nullsLast().op("date_ops")),
	foreignKey({
			columns: [table.courseClassId],
			foreignColumns: [courseClass.id],
			name: "fk_schedule_course_class_id_course_class_id"
		}),
	foreignKey({
			columns: [table.conductorId],
			foreignColumns: [employee.id],
			name: "fk_schedule_conductor_id_employee_id"
		}),
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [room.id],
			name: "fk_schedule_room_id_room_id"
		}),
	foreignKey({
			columns: [table.statusId],
			foreignColumns: [scheduleStatus.id],
			name: "fk_schedule_status_id_schedule_status_id"
		}),
	foreignKey({
			columns: [table.type],
			foreignColumns: [scheduleType.id],
			name: "fk_schedule_type_schedule_type_id"
		}),
]);

export const scholarshipPolicy = pgTable("scholarship_policy", {
	id: smallserial().primaryKey().notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	type: enumDiscountType().notNull(),
	value: numeric({ precision: 15, scale:  2 }).notNull(),
	des: text(),
}, (table) => [
	unique("scholarship_policy_code_key").on(table.code),
]);

export const gradeScale = pgTable("grade_scale", {
	id: smallserial().primaryKey().notNull(),
	minScore10: numeric("min_score_10", { precision: 4, scale:  2 }),
	letterGrade: varchar("letter_grade", { length: 5 }),
	gpaScore4: numeric("gpa_score_4", { precision: 4, scale:  2 }),
	des: varchar({ length: 100 }),
});

export const systemAuditLog = pgTable("system_audit_log", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	actorId: uuid("actor_id").notNull(),
	action: varchar({ length: 50 }).notNull(),
	targetResource: varchar("target_resource", { length: 100 }),
	targetId: varchar("target_id", { length: 255 }),
	payload: jsonb(),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.actorId],
			foreignColumns: [account.id],
			name: "fk_system_audit_log_actor_id_account_id"
		}),
]);

export const chatGroupMember = pgTable("chat_group_member", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	groupId: uuid("group_id").notNull(),
	uid: uuid().notNull(),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }),
	nickname: varchar({ length: 255 }),
	pfpUrl: text("pfp_url"),
}, (table) => [
	uniqueIndex("chat_group_member_idx_chat_gmember").using("btree", table.groupId.asc().nullsLast().op("uuid_ops"), table.uid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [chatGroup.id],
			name: "fk_chat_group_member_group_id_chat_group_id"
		}),
	foreignKey({
			columns: [table.uid],
			foreignColumns: [account.id],
			name: "fk_chat_group_member_uid_account_id"
		}),
]);

export const scheduleStatus = pgTable("schedule_status", {
	id: smallserial().primaryKey().notNull(),
	code: varchar({ length: 30 }),
	name: varchar({ length: 255 }),
	des: text(),
	isComplete: boolean("is_complete").default(false).notNull(),
});

export const systemAuthority = pgTable("system_authority", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	name: varchar({ length: 255 }),
	des: text(),
	isSensitive: boolean("is_sensitive").default(false).notNull(),
});

export const notification = pgTable("notification", {
	id: uuid().primaryKey().notNull(),
	templateId: integer("template_id"),
	actorId: uuid("actor_id"),
	title: varchar({ length: 255 }).notNull(),
	body: text(),
	data: jsonb(),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.actorId],
			foreignColumns: [account.id],
			name: "fk_notification_actor_id_account_id"
		}),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [notificationTemplate.id],
			name: "fk_notification_template_id_notification_template_id"
		}),
]);

export const profile = pgTable("profile", {
	id: uuid().primaryKey().notNull(),
	accountId: uuid("account_id"),
	fullname: varchar({ length: 255 }),
	gender: enumGender().notNull(),
	dob: date().notNull(),
	address: text(),
	countryCode: varchar("country_code", { length: 2 }),
	nationalId: varchar("national_id", { length: 255 }).notNull(),
	ethnic: varchar({ length: 255 }),
	religious: varchar({ length: 255 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	schemaId: bigint("schema_id", { mode: "number" }).notNull(),
	dynamicData: jsonb("dynamic_data"),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [account.id],
			name: "fk_profile_account_id_account_id"
		}),
	foreignKey({
			columns: [table.schemaId],
			foreignColumns: [profileSchema.id],
			name: "fk_profile_schema_id_profile_schema_id"
		}),
	unique("profile_national_id_key").on(table.nationalId),
]);

export const message = pgTable("message", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	replyToId: bigint("reply_to_id", { mode: "number" }),
	type: varchar({ length: 255 }),
	groupId: uuid("group_id"),
	sender: uuid(),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	payload: jsonb().notNull(),
	state: enumMsgState(),
	isPinned: boolean("is_pinned").default(false),
}, (table) => [
	foreignKey({
			columns: [table.sender],
			foreignColumns: [account.id],
			name: "fk_message_sender_account_id"
		}),
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [chatGroup.id],
			name: "fk_message_group_id_chat_group_id"
		}),
	foreignKey({
			columns: [table.replyToId],
			foreignColumns: [table.id],
			name: "fk_message_reply_to_id_message_id"
		}),
]);

export const room = pgTable("room", {
	id: smallserial().primaryKey().notNull(),
	code: varchar({ length: 30 }).notNull(),
	buildingId: smallint("building_id").notNull(),
	capacity: smallint(),
	type: varchar({ length: 50 }),
}, (table) => [
	foreignKey({
			columns: [table.buildingId],
			foreignColumns: [building.id],
			name: "fk_room_building_id_building_id"
		}),
	unique("room_code_key").on(table.code),
]);

export const courseMaterial = pgTable("course_material", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	courseClassId: uuid("course_class_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	fileUrl: text("file_url").notNull(),
	uploadBy: uuid("upload_by"),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.courseClassId],
			foreignColumns: [courseClass.id],
			name: "fk_course_material_course_class_id_course_class_id"
		}),
	foreignKey({
			columns: [table.uploadBy],
			foreignColumns: [employee.id],
			name: "fk_course_material_upload_by_employee_id"
		}),
]);

export const employee = pgTable("employee", {
	id: uuid().primaryKey().notNull(),
	code: varchar({ length: 30 }).notNull(),
	profileId: uuid("profile_id"),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.profileId],
			foreignColumns: [profile.id],
			name: "fk_employee_profile_id_profile_id"
		}),
	unique("employee_code_key").on(table.code),
]);

export const student = pgTable("student", {
	id: uuid().primaryKey().notNull(),
	code: varchar({ length: 30 }).notNull(),
	profileId: uuid("profile_id").notNull(),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.profileId],
			foreignColumns: [profile.id],
			name: "fk_student_profile_id_profile_id"
		}),
	unique("student_code_key").on(table.code),
	unique("student_profile_id_key").on(table.profileId),
]);

export const invoice = pgTable("invoice", {
	id: uuid().primaryKey().notNull(),
	studentId: uuid("student_id").notNull(),
	semesterId: smallint("semester_id").notNull(),
	originalAmount: numeric("original_amount", { precision: 15, scale:  2 }).notNull(),
	discountAmount: numeric("discount_amount", { precision: 15, scale:  2 }).default('0'),
	finalAmount: numeric("final_amount", { precision: 15, scale:  2 }).notNull(),
	status: enumPaymentStatus(),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
	dueDate: timestamp("due_date", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.semesterId],
			foreignColumns: [semester.id],
			name: "fk_invoice_semester_id_semester_id"
		}),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [student.id],
			name: "fk_invoice_student_id_student_id"
		}),
]);

export const profileSchema = pgTable("profile_schema", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	effectiveDate: date("effective_date").notNull(),
	expiredDate: date("expired_date"),
	schemaCode: varchar("schema_code", { length: 255 }).notNull(),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).notNull(),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
	des: text(),
});

export const chatGroup = pgTable("chat_group", {
	id: uuid().primaryKey().notNull(),
	type: varchar({ length: 255 }).notNull(),
	head: uuid().notNull(),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.head],
			foreignColumns: [account.id],
			name: "fk_chat_group_head_account_id"
		}),
]);

export const systemSetting = pgTable("system_setting", {
	key: varchar({ length: 255 }).primaryKey().notNull(),
	value: jsonb(),
	valueType: varchar("value_type", { length: 255 }),
	displayName: varchar("display_name", { length: 255 }),
	des: text(),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
	updateBy: uuid("update_by"),
	isSensitive: boolean("is_sensitive").default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.updateBy],
			foreignColumns: [account.id],
			name: "fk_system_setting_update_by_account_id"
		}),
]);

export const major = pgTable("major", {
	id: uuid().primaryKey().notNull(),
	code: varchar({ length: 30 }).notNull(),
	des: varchar({ length: 512 }),
	departmentId: uuid("department_id").notNull(),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [department.id],
			name: "fk_major_department_id_department_id"
		}),
	unique("major_code_key").on(table.code),
]);

export const mainClass = pgTable("main_class", {
	id: uuid().primaryKey().notNull(),
	code: varchar({ length: 30 }).notNull(),
	teacher: uuid().notNull(),
	typeId: smallint("type_id"),
	majorId: uuid("major_id").notNull(),
	academicYear: smallint("academic_year").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.typeId],
			foreignColumns: [educationType.id],
			name: "fk_main_class_type_id_education_type_id"
		}),
	foreignKey({
			columns: [table.teacher],
			foreignColumns: [employee.id],
			name: "fk_main_class_teacher_employee_id"
		}),
	foreignKey({
			columns: [table.majorId],
			foreignColumns: [major.id],
			name: "fk_main_class_major_id_major_id"
		}),
	unique("main_class_code_key").on(table.code),
]);

export const subject = pgTable("subject", {
	id: uuid().primaryKey().notNull(),
	code: varchar({ length: 30 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	credits: smallint().notNull(),
	des: varchar({ length: 255 }),
	recommendedSemesterIndex: smallint("recommended_semester_index"),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("subject_code_key").on(table.code),
]);

export const groupRoleAuthority = pgTable("group_role_authority", {
	authorityId: varchar("authority_id", { length: 255 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	roleId: bigint("role_id", { mode: "number" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorityId],
			foreignColumns: [groupAuthority.id],
			name: "fk_group_role_authority_authority_id_group_authority_id"
		}),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [groupRole.id],
			name: "fk_group_role_authority_role_id_group_role_id"
		}),
	primaryKey({ columns: [table.authorityId, table.roleId], name: "group_role_authority_pkey"}),
]);

export const messageRead = pgTable("message_read", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	messageId: bigint("message_id", { mode: "number" }).notNull(),
	recipientId: uuid("recipient_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.recipientId],
			foreignColumns: [account.id],
			name: "fk_message_read_recipient_id_account_id"
		}),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [message.id],
			name: "fk_message_read_message_id_message_id"
		}),
	primaryKey({ columns: [table.messageId, table.recipientId], name: "message_read_pkey"}),
]);

export const userSystemRole = pgTable("user_system_role", {
	userId: uuid("user_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	systemRole: bigint("system_role", { mode: "number" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [account.id],
			name: "fk_user_system_role_user_id_account_id"
		}),
	foreignKey({
			columns: [table.systemRole],
			foreignColumns: [systemRole.id],
			name: "fk_user_system_role_system_role_system_role_id"
		}),
	primaryKey({ columns: [table.userId, table.systemRole], name: "user_system_role_pkey"}),
]);

export const systemRoleAuthority = pgTable("system_role_authority", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	roleId: bigint("role_id", { mode: "number" }).notNull(),
	authorityId: varchar("authority_id", { length: 255 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorityId],
			foreignColumns: [systemAuthority.id],
			name: "fk_system_role_authority_authority_id_system_authority_id"
		}),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [systemRole.id],
			name: "fk_system_role_authority_role_id_system_role_id"
		}),
	primaryKey({ columns: [table.roleId, table.authorityId], name: "system_role_authority_pkey"}),
]);

export const memberRole = pgTable("member_role", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	roleId: bigint("role_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	memberId: bigint("member_id", { mode: "number" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.memberId],
			foreignColumns: [chatGroupMember.id],
			name: "fk_member_role_member_id_chat_group_member_id"
		}),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [groupRole.id],
			name: "fk_member_role_role_id_group_role_id"
		}),
	primaryKey({ columns: [table.roleId, table.memberId], name: "member_role_pkey"}),
]);

export const profileSchemaField = pgTable("profile_schema_field", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	fieldId: bigint("field_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	schemaId: bigint("schema_id", { mode: "number" }).notNull(),
	isRequired: boolean("is_required").default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.fieldId],
			foreignColumns: [profileField.id],
			name: "fk_profile_schema_field_field_id_profile_field_id"
		}),
	foreignKey({
			columns: [table.schemaId],
			foreignColumns: [profileSchema.id],
			name: "fk_profile_schema_field_schema_id_profile_schema_id"
		}),
	primaryKey({ columns: [table.fieldId, table.schemaId], name: "profile_schema_field_pkey"}),
]);

export const subjectPrerequisite = pgTable("subject_prerequisite", {
	subjectId: uuid("subject_id").notNull(),
	prerequisiteId: uuid("prerequisite_id").notNull(),
	type: varchar({ length: 50 }),
}, (table) => [
	foreignKey({
			columns: [table.prerequisiteId],
			foreignColumns: [subject.id],
			name: "fk_subject_prerequisite_prerequisite_id_subject_id"
		}),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subject.id],
			name: "fk_subject_prerequisite_subject_id_subject_id"
		}),
	primaryKey({ columns: [table.subjectId, table.prerequisiteId], name: "subject_prerequisite_pkey"}),
]);

export const systemBroadcastRead = pgTable("system_broadcast_read", {
	broadcastId: integer("broadcast_id").notNull(),
	userId: uuid("user_id").notNull(),
	readAt: timestamp("read_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [account.id],
			name: "fk_system_broadcast_read_user_id_account_id"
		}),
	foreignKey({
			columns: [table.broadcastId],
			foreignColumns: [systemBroadcast.id],
			name: "fk_system_broadcast_read_broadcast_id_system_broadcast_id"
		}),
	primaryKey({ columns: [table.broadcastId, table.userId], name: "system_broadcast_read_pkey"}),
]);

export const mainClassMember = pgTable("main_class_member", {
	studentId: uuid("student_id").notNull(),
	roleId: smallint("role_id"),
	classId: uuid("class_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.classId],
			foreignColumns: [mainClass.id],
			name: "fk_main_class_member_class_id_main_class_id"
		}),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [classRole.id],
			name: "fk_main_class_member_role_id_class_role_id"
		}),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [student.id],
			name: "fk_main_class_member_student_id_student_id"
		}),
	primaryKey({ columns: [table.studentId, table.classId], name: "main_class_member_pkey"}),
]);

export const userNotificationSetting = pgTable("user_notification_setting", {
	userId: uuid("user_id").notNull(),
	notificationType: notificationType("notification_type").notNull(),
	channel: notificationChannel().notNull(),
	isEnabled: boolean("is_enabled").default(true),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [account.id],
			name: "fk_user_notification_setting_user_id_account_id"
		}),
	primaryKey({ columns: [table.userId, table.notificationType, table.channel], name: "user_notification_setting_pkey"}),
]);

export const curriculumSubject = pgTable("curriculum_subject", {
	subjectId: uuid("subject_id").notNull(),
	curriculumId: integer("curriculum_id").notNull(),
	semesterIndex: smallint("semester_index"),
	isCompulsory: boolean("is_compulsory").default(true),
	knowledgeBlockId: smallint("knowledge_block_id"),
}, (table) => [
	foreignKey({
			columns: [table.curriculumId],
			foreignColumns: [curriculum.id],
			name: "fk_curriculum_subject_curriculum_id_curriculum_id"
		}),
	foreignKey({
			columns: [table.knowledgeBlockId],
			foreignColumns: [knowledgeBlock.id],
			name: "fk_curriculum_subject_knowledge_block_id_knowledge_block_id"
		}),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subject.id],
			name: "fk_curriculum_subject_subject_id_subject_id"
		}),
	primaryKey({ columns: [table.subjectId, table.curriculumId], name: "curriculum_subject_pkey"}),
]);

export const departmentEmployment = pgTable("department_employment", {
	employeeId: uuid("employee_id").notNull(),
	departmentId: uuid("department_id").notNull(),
	assignDate: date("assign_date").notNull(),
	unassignDate: date("unassign_date"),
	roleCode: varchar("role_code", { length: 30 }),
	roleName: varchar("role_name", { length: 255 }),
}, (table) => [
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [department.id],
			name: "fk_department_employment_department_id_department_id"
		}),
	foreignKey({
			columns: [table.employeeId],
			foreignColumns: [employee.id],
			name: "fk_department_employment_employee_id_employee_id"
		}),
	primaryKey({ columns: [table.employeeId, table.departmentId], name: "department_employment_pkey"}),
]);

export const attendanceStatus = pgTable("attendance_status", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	enrollId: bigint("enroll_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	scheduleId: bigint("schedule_id", { mode: "number" }).notNull(),
	state: enumAttendanceState().notNull(),
	note: varchar({ length: 255 }),
	createAt: timestamp("create_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updateAt: timestamp("update_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.enrollId],
			foreignColumns: [enrollment.id],
			name: "fk_attendance_status_enroll_id_enrollment_id"
		}),
	foreignKey({
			columns: [table.scheduleId],
			foreignColumns: [schedule.id],
			name: "fk_attendance_status_schedule_id_schedule_id"
		}),
	primaryKey({ columns: [table.enrollId, table.scheduleId], name: "attendance_status_pkey"}),
]);
