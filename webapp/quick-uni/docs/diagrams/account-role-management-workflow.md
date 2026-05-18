# Sơ đồ Luồng Quản lý Phân quyền Tài khoản (Swimlane Flowchart)

```mermaid
flowchart TD
    %% Define Subgraphs for Actors
    subgraph Admin ["System Admin"]
        direction TB
        A1[Tạo/Cập nhật Role]
        A2[Gán Quyền - Authorities cho Role]
        A3[Chọn Tài khoản cần phân quyền]
        A4[Gán Roles cho Tài khoản]
    end

    subgraph RS ["Role Service"]
        direction TB
        R1[updateRoleAuthorities]
        R2[updateUserRoles]
        R3[Tổng hợp quyền thực tế]
    end

    subgraph DB ["Database"]
        direction TB
        D1[Lưu Role & Authorities Mapping]
        D2[Lưu User & Role Mapping]
    end

    subgraph Target ["Target Account"]
        direction TB
        T1[Đăng nhập / Hành động]
        T2[Nhận kết quả: Allow/Deny]
    end

    %% Define Flow / Transitions
    %% Role Definition Phase
    A1 --> A2
    A2 --> R1
    R1 --> D1

    %% User Role Assignment Phase
    A3 --> A4
    A4 --> R2
    R2 --> D2

    %% Execution Phase
    T1 --> R3
    D1 --> R3
    D2 --> R3
    R3 --> T2

    %% Styling
    classDef admin fill:#f9f,stroke:#333,stroke-width:2px;
    classDef rs fill:#bbf,stroke:#333,stroke-width:2px;
    classDef db fill:#dfd,stroke:#333,stroke-width:2px;
    classDef target fill:#fdb,stroke:#333,stroke-width:2px;

    class A1,A2,A3,A4 admin;
    class R1,R2,R3 rs;
    class D1,D2 db;
    class T1,T2 target;
```
