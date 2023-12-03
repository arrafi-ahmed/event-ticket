-- App User Information
CREATE TABLE app_user
(
    id        serial PRIMARY KEY,
    email     varchar(255) NOT NULL UNIQUE,
    password  varchar(255) NOT NULL,
    role      smallint     NOT NULL,
    full_name varchar(255) NOT NULL
);

-- Users Information
CREATE TABLE users
(
    id                   serial PRIMARY KEY,
    firstname            varchar(50),
    lastname             varchar(50),
    email                varchar(50),
    phone                varchar(50),
    job_title            varchar(255),
    organization         varchar(255),
    country              varchar(255),
    role                 varchar(50),
    created_at           timestamp with time zone NOT NULL,
    registration_form_id integer REFERENCES registration_form ON DELETE CASCADE
);

-- Event Information
CREATE TABLE event
(
    id             serial PRIMARY KEY,
    name           varchar(255)  NOT NULL,
    date           date          NOT NULL,
    location       varchar(255)  NOT NULL,
    tax_percentage numeric(4, 2) NOT NULL,
    logo_left      varchar(255),
    logo_right     varchar(255),
    terms          text          NOT NULL
);

-- Badge Design Information
CREATE TABLE badge_design
(
    id                   serial PRIMARY KEY,
    title                varchar(255) NOT NULL,
    color_scheme         varchar(50)  NOT NULL,
    text_top_left        varchar(255),
    text_top_right       varchar(255),
    text_bottom_left     varchar(255),
    text_bottom_right    varchar(255),
    registration_form_id integer REFERENCES registration_form ON DELETE CASCADE,
    event_id             integer REFERENCES event ON DELETE CASCADE
);

-- Registration Form Type
CREATE TABLE registration_form_type
(
    id   serial PRIMARY KEY,
    name varchar(50) NOT NULL
);

-- Registration Form Information
CREATE TABLE registration_form
(
    id           serial PRIMARY KEY,
    form_type_id smallint NOT NULL REFERENCES registration_form_type,
    event_id     integer REFERENCES event ON DELETE CASCADE
);

-- Question Information
CREATE TABLE question
(
    id                   SERIAL PRIMARY KEY,
    type_id              SMALLINT NOT NULL,
    text                 TEXT     NOT NULL,
    instruction          TEXT,
    required             BOOLEAN  NOT NULL,
    options              TEXT[],
    registration_form_id INTEGER REFERENCES registration_form ON DELETE CASCADE
);

-- Answer Information
CREATE TABLE answer
(
    id          serial PRIMARY KEY,
    answer_text text NOT NULL,
    question_id integer REFERENCES question ON DELETE CASCADE
);

-- Registration Information
CREATE TABLE registration
(
    id                   serial PRIMARY KEY,
    created_at           date NOT NULL,
    status               varchar(50),
    registered_user_id   integer [],
    registration_form_id integer REFERENCES registration_form ON DELETE CASCADE
);

-- Ticket Information
CREATE TABLE ticket
(
    id                   serial PRIMARY KEY,
    name                 varchar(255) NOT NULL,
    stock_init           integer      NOT NULL,
    stock_curr           integer,
    price                numeric      NOT NULL,
    currency             CHAR(3)      NOT NULL,
    ticket_type          varchar(50)  NOT NULL,                                  --standard, free, addons
    registration_form_id integer REFERENCES registration_form ON DELETE CASCADE, --ignore for addons
    badge_design_id      integer REFERENCES badge_design ON DELETE CASCADE,
    event_id             integer REFERENCES event ON DELETE CASCADE
);

-- Early Bird Ticket Information
CREATE TABLE early_bird
(
    id               serial PRIMARY KEY,
    start_date       date    NOT NULL,
    end_date         date    NOT NULL,
    early_bird_price numeric NOT NULL,
    ticket_id        integer REFERENCES ticket ON DELETE CASCADE
);

-- Promo Code Information
CREATE TABLE promo_code
(
    id             serial PRIMARY KEY,
    code           varchar(50) NOT NULL,
    discount_type  varchar(50) NOT NULL,
    discount_value numeric     NOT NULL,
    event_id       integer REFERENCES event ON DELETE CASCADE,
    ticket_id      integer REFERENCES ticket ON DELETE CASCADE
);

-- Purchase Information
CREATE TABLE purchase
(
    id              serial PRIMARY KEY,
    payment_method  varchar(50)              NOT NULL,
    payment_status  varchar(50)              NOT NULL,
    total_amount    numeric                  NOT NULL,
    created_at      timestamp with time zone NOT NULL,
    registration_id integer REFERENCES registration ON DELETE CASCADE,
    ticket_id       integer[] NOT NULL,
    promo_code_id   integer                  REFERENCES promo_code ON DELETE SET NULL
);

-- Badge Information
CREATE TABLE badge
(
    id              serial PRIMARY KEY,
    qrcode_uuid     uuid        NOT NULL,
    badge_status    varchar(50) NOT NULL,
    badge_design_id integer REFERENCES badge_design ON DELETE CASCADE,
    user_id         integer REFERENCES users ON DELETE CASCADE
);

-- Badge Scan Information
CREATE TABLE badge_scan
(
    id           serial PRIMARY KEY,
    created_at   timestamp with time zone NOT NULL,
    exhibitor_id integer REFERENCES users ON DELETE CASCADE,
    badge_id     integer REFERENCES badge ON DELETE CASCADE
);

-- Badge Visibility Information
CREATE TABLE badge_visibility
(
    id             serial PRIMARY KEY,
    field_id_front integer[] NOT NULL,
    field_id_rear  integer[] NOT NULL,
    badge_id       integer REFERENCES badge_design ON DELETE CASCADE
);

-- Fields Information
CREATE TABLE field
(
    id         serial PRIMARY KEY,
    field_name varchar(255) NOT NULL,
    type       smallint     NOT NULL,
    required   boolean
);

-- Sample Data for Fields
INSERT INTO field (id, field_name, type, required)
VALUES (1, 'Firstname', 0, true),
       (2, 'Surname', 0, true),
       (3, 'Job Title', 0, true),
       (4, 'Organization', 0, true),
       (5, 'Country', 4, true),
       (6, 'Phone', 0, true),
       (7, 'Email', 0, true);

-- Field Registration Form
CREATE TABLE field_registration_form
(
    id                   serial PRIMARY KEY,
    field_id             integer REFERENCES field ON DELETE CASCADE,
    registration_form_id integer REFERENCES registration_form ON DELETE CASCADE
);