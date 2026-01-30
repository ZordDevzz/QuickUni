erDiagram
	mess2target }o--|| message : references
	student ||--|| account : references
	enrollment }o--|| student : references
	mess2target }o--|| target : references
	chat_group }o--|| account : references
	entities_group }o--|| account : references
	entities_group }o--|| chat_group : references
	course_class }o--|| employee : references
	main_class }o--|| employee : references
	department }o--|| employee : references
	department ||--o{ employee : references
	department ||--o{ major : references
	major ||--o{ subject : references
	subject ||--o{ course_class : references
	employee ||--|| account : references
	course_class ||--o{ schedule : references
	course_class ||--o{ enrollment : references
	student }o--|| main_class : references
	major ||--o{ main_class : references
	student ||--|| main_class : references
	entities_group }o--|| group_role : references
	group_role_authority }o--|| group_role : references
	group_role_authority }o--|| group_authority : references
	message }o--|| chat_group : references
	notif }o--|| account : references
	notif }o--|| message : references

	account {
		UUID id
		VARCHAR(255) username
		VARCHAR(64) pwd
		ENUM_ACCOUNT_TYPE type
	}

	employee {
		UUID account_id
		VARCHAR(30) id
		VARCHAR(255) fullname
		ENUM_GENDER gender
		DATE dob
		VARCHAR(30) role_id
		VARCHAR(512) address
		VARCHAR(2) country_code
		VARCHAR(255) national_id
		VARCHAR(30) department_id
	}

	student {
		UUID account_id
		VARCHAR(30) id
		VARCHAR(30) main_class_id
		VARCHAR(255) fullname
		ENUM_GENDER gender
		DATE dob
		VARCHAR(512) address
		VARCHAR(2) country_code
		VARCHAR(255) national_id
	}

	department {
		VARCHAR(30) head
		VARCHAR(30) id
		VARCHAR(255) name
		VARCHAR(512) des
	}

	main_class {
		VARCHAR(30) monitor
		VARCHAR(30) id
		VARCHAR(30) teacher
		VARCHAR(30) major_id
	}

	course_class {
		VARCHAR(30) id
		VARCHAR(30) subject_id
		VARCHAR(30) teacher_id
	}

	subject {
		VARCHAR(30) id
		VARCHAR(255) name
		SMALLINT credits
		VARCHAR(30) major_id
		VARCHAR(255) des
	}

	enrollment {
		VARCHAR(30) student_id
		VARCHAR(30) course_class_id
		BIGINT id
		ENUM_ENROLL_STATUS status
	}

	message {
		BIGINT id
		VARCHAR(255) source
		VARCHAR(255) type
		UUID group_id
	}

	target {
		BIGINT id
		VARCHAR(255) type
		VARCHAR(255) entity_id
	}

	entities_group {
		BIGINT role
		UUID uid
		UUID guid
	}

	group_role {
		BIGINT id
		VARCHAR(255) name
	}

	group_authority {
		VARCHAR(255) id
	}

	schedule {
		BIGINT id
		ENUM_SCHEDULE_TYPE type
		DATE schedule_date
		VARCHAR(30) course_class_id
	}

	major {
		VARCHAR(30) id
		VARCHAR(512) des
		VARCHAR(30) department_id
	}

	mess2target {
		BIGINT id
		BIGINT msg_id
		BIGINT target_id
	}

	chat_group {
		UUID id
		VARCHAR(255) type
		UUID head
	}

	group_role_authority {
		BIGINT role_id
		VARCHAR(255) authority_id
	}

	notif {
		BIGINT id
		BOOLEAN is_read
		VARCHAR(255) title
		VARCHAR(512) sub
		JSON action
		UUID target
		BIGINT src
	}