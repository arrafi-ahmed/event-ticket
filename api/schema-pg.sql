-- Event Information
CREATE TABLE event
(
    id             serial PRIMARY KEY,
    name           varchar(255)  NOT NULL,
    location       varchar(255)  NOT NULL,
    start_date     date,
    end_date       date,
    tax_percentage numeric(4, 2) NOT NULL,
    logo_left      varchar(255),
    logo_right     varchar(255)
);
ALTER TABLE event
    ADD COLUMN start_date date;
ALTER TABLE event
    ADD COLUMN end_date date;

-- Registration Form Type
CREATE TABLE registration_form_type
(
    id       serial PRIMARY KEY,
    name     varchar(50) NOT NULL,
    event_id integer REFERENCES event --added
);
--temp
ALTER TABLE registration_form_type
    ADD COLUMN event_id integer REFERENCES event;

-- Registration Form Information
CREATE TABLE registration_form
(
    id           serial PRIMARY KEY,
    form_type_id integer REFERENCES registration_form_type NOT NULL, --changed from smallint to int
    event_id     integer REFERENCES event,
    terms        text                                                --added
);
--temp
ALTER TABLE registration_form
    ADD COLUMN terms text;
ALTER TABLE registration_form
    ALTER COLUMN form_type_id TYPE integer;

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
    registration_form_id integer REFERENCES registration_form,
    event_id             integer REFERENCES event
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
    ticket_type          varchar(50)  NOT NULL, --standard, free, extras
    registration_form_id integer REFERENCES registration_form,
    badge_design_id      integer REFERENCES badge_design,
    event_id             integer REFERENCES event
);

-- Users Information -- user is safe to delete while deleting from registration
CREATE TABLE users
(
    id                   serial PRIMARY KEY,
    firstname            varchar(50),
    surname              varchar(50),
    email                varchar(50),
    phone                varchar(50),
    job_title            varchar(255),
    organization         varchar(255),
    country              varchar(255),
    role                 varchar(50),
    created_at           timestamp with time zone NOT NULL,
    registration_form_id integer REFERENCES registration_form,
    ticket_id            integer REFERENCES ticket
);

-- Registration Information
CREATE TABLE registration
(
    id                   serial PRIMARY KEY,
    created_at           date                                 NOT NULL,
    status               varchar(50),
    registered_user_id   integer[]                            NOT NULL,
    form_filler          integer REFERENCES users (id)        NOT NULL,
    registration_form_id integer REFERENCES registration_form NOT NULL
);

-- App User Information
CREATE TABLE app_user
(
    id       serial PRIMARY KEY,
    username varchar(255) NOT NULL,    --modified -- changed name and removed unique constraint
    password varchar(255) NOT NULL,
    role     smallint     NOT NULL,    -- 10 -> admin, 20 -> checkin staff, 30 -> exhibitor
    event_id integer REFERENCES event, -- added
    user_id  integer REFERENCES users  -- added
);
GRANT SELECT, INSERT, UPDATE, DELETE ON app_user TO torchevents_user;

-- Question Information
CREATE TABLE question
(
    id                   SERIAL PRIMARY KEY,
    type_id              SMALLINT NOT NULL,
    text                 TEXT     NOT NULL,
    instruction          TEXT,
    required             BOOLEAN  NOT NULL,
    options              TEXT[],
    registration_form_id INTEGER REFERENCES registration_form
);

-- Answer Information
CREATE TABLE answer
(
    id          serial PRIMARY KEY,
    answer_text text                          NOT NULL,
    question_id integer REFERENCES question,
    form_filler integer REFERENCES users (id) NOT NULL
);

-- Early Bird Ticket Information
CREATE TABLE early_bird
(
    id               serial PRIMARY KEY,
    start_date       date    NOT NULL,
    end_date         date    NOT NULL,
    early_bird_price numeric NOT NULL,
    ticket_id        integer REFERENCES ticket
);

-- Promo Code Information
CREATE TABLE promo_code
(
    id             serial PRIMARY KEY,
    code           varchar(50) NOT NULL,
    discount_type  varchar(50) NOT NULL,
    discount_value numeric     NOT NULL,
    event_id       integer REFERENCES event,
    ticket_id      integer REFERENCES ticket
);

-- Purchase Information
CREATE TABLE purchase
(
    id                  serial PRIMARY KEY,
    payment_method      varchar(50)              NOT NULL,
    payment_status      varchar(50)              NOT NULL,
    created_at          timestamp with time zone NOT NULL,
    tax                 numeric,
    total_amount        numeric                  NOT NULL,
    non_extras          integer[]                NOT NULL,
    non_extras_quantity integer[]                NOT NULL,
    non_extras_price    integer[]                NOT NULL,
    extras              integer[],
    extras_quantity     integer[],
    extras_price        integer[],
    registration_id     integer REFERENCES registration,
    promo_code_id       integer                  REFERENCES promo_code ON DELETE SET NULL
);

-- Badge Information
CREATE TABLE badge
(
    id              serial PRIMARY KEY,
    qr_uuid         uuid                      NOT NULL,
    badge_status    integer, -- 1 -> scanned/ 0 -> not scanned
    badge_design_id integer REFERENCES badge_design,
    user_id         integer REFERENCES users,
    ticket_id       integer REFERENCES ticket NOT NULL,
    purchase_id     integer REFERENCES purchase
);

-- Badge Scan Information
CREATE TABLE badge_scan
(
    id           serial PRIMARY KEY,
    created_at   timestamp with time zone NOT NULL,
    exhibitor_id integer REFERENCES users,
    badge_id     integer REFERENCES badge
);

-- Badge Visibility Information
CREATE TABLE badge_visibility
(
    id              serial PRIMARY KEY,
    field_id_front  integer[] NOT NULL,
    field_id_rear   integer[] NOT NULL,
    badge_design_id integer REFERENCES badge_design
);

-- Fields Information
CREATE TABLE field
(
    id         serial PRIMARY KEY,
    field_name varchar(255) NOT NULL,
    type       smallint     NOT NULL,
    required   boolean
);

-- 0 -> v-text-field
-- 1 -> v-textarea
-- 2 -> v-radio-group
-- 3 -> v-checkbox
-- 4 -> v-select (standard)
-- 5 -> v-select (custom)

-- Sample Data for Fields
INSERT INTO field (id, field_name, type, required)
VALUES (1, 'Firstname', 0, true),
       (2, 'Surname', 0, true),
       (3, 'Job Title', 0, true),
       (4, 'Organization', 0, true),
       (5, 'Country', 4, true),
       (6, 'Phone', 5, true), --changed from 4 to 5
       (7, 'Email', 0, true);

-- Field Registration Form
CREATE TABLE field_registration_form
(
    id                   serial PRIMARY KEY,
    field_id             integer REFERENCES field,
    registration_form_id integer REFERENCES registration_form
);

-- Used for reporting purpose
CREATE TABLE survey_filler
(
    id                   serial PRIMARY KEY,
    firstname            varchar(50),
    surname              varchar(50),
    email                varchar(50),
    phone                varchar(50),
    job_title            varchar(255),
    organization         varchar(255),
    country              varchar(255),
    role                 varchar(50),
    created_at           timestamp with time zone NOT NULL,
    user_id              integer REFERENCES users,
    registration_form_id integer REFERENCES registration_form,
    registration_id      integer REFERENCES registration,
    purchase_id          integer REFERENCES purchase,
    answer_id            integer[]
);