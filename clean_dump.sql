--
-- PostgreSQL database dump
--


-- Dumped from database version 18.1 (Debian 18.1-1.pgdg13+2)
-- Dumped by pg_dump version 18.1 (Debian 18.1-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: MessageStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MessageStatus" AS ENUM (
    'SENT',
    'DELIVERED',
    'SEEN'
);


--
-- Name: MessageType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MessageType" AS ENUM (
    'TEXT',
    'IMAGE',
    'FILE'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Conversation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Conversation" (
    id text NOT NULL,
    "directConversationKey" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ConversationMember; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ConversationMember" (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "userId" text NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "senderId" text NOT NULL,
    ciphertext text NOT NULL,
    "messageType" public."MessageType" NOT NULL,
    status public."MessageStatus" NOT NULL,
    "protocolVersion" text NOT NULL,
    "isPreKeyMessage" boolean NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deliveredAt" timestamp(3) without time zone,
    "seenAt" timestamp(3) without time zone
);


--
-- Name: RefreshToken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RefreshToken" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "tokenHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "displayName" text NOT NULL,
    "uniqueUserId" text NOT NULL,
    "recoveryKeyFingerprint" text NOT NULL,
    "recoveryKeyHash" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: UserIdentityKey; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserIdentityKey" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "registrationId" integer NOT NULL,
    "publicKey" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: UserOneTimePreKey; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserOneTimePreKey" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "keyId" integer NOT NULL,
    "publicKey" text NOT NULL,
    "isUsed" boolean DEFAULT false NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: UserSignedPreKey; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserSignedPreKey" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "keyId" integer NOT NULL,
    "publicKey" text NOT NULL,
    signature text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: Conversation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Conversation" (id, "directConversationKey", "createdAt", "updatedAt") FROM stdin;
06e7b816-1d64-405c-a9c9-9acdc6b94ea0	137b371c-3c0a-4286-951b-7c61ffed74fe_89733fd7-a7a1-4339-aa67-6968ea97908a	2026-03-29 15:29:36.004	2026-03-29 15:29:36.004
b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a_d608872c-f9b5-48e0-a41e-4bb0a591a49f	2026-04-05 07:57:37.291	2026-04-05 07:57:37.291


--
-- Data for Name: ConversationMember; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ConversationMember" (id, "conversationId", "userId", "joinedAt") FROM stdin;
464a3f6e-f407-4b53-be9b-f8166f4a2072	06e7b816-1d64-405c-a9c9-9acdc6b94ea0	137b371c-3c0a-4286-951b-7c61ffed74fe	2026-03-29 15:29:36.004
9da25403-0c3f-4a5a-97a5-86c9f9b01c00	06e7b816-1d64-405c-a9c9-9acdc6b94ea0	89733fd7-a7a1-4339-aa67-6968ea97908a	2026-03-29 15:29:36.004
8ee2391e-59b9-4646-9d90-b73cd80d3a68	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	2026-04-05 07:57:37.291
e8bdc307-d62f-4d71-8ba7-eed5e6edbbd8	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	2026-04-05 07:57:37.291


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Message" (id, "conversationId", "senderId", ciphertext, "messageType", status, "protocolVersion", "isPreKeyMessage", "createdAt", "deliveredAt", "seenAt") FROM stdin;
9c97579c-4d8b-496c-9668-bc9b431df454	06e7b816-1d64-405c-a9c9-9acdc6b94ea0	137b371c-3c0a-4286-951b-7c61ffed74fe	helsdlow	TEXT	SENT	1.0	f	2026-03-29 17:09:46.992	\N	\N
8bec25bd-247f-4f90-8956-164e0b506707	06e7b816-1d64-405c-a9c9-9acdc6b94ea0	137b371c-3c0a-4286-951b-7c61ffed74fe	helsdlow	TEXT	SENT	1.0	f	2026-03-29 17:15:06.328	\N	\N
9e73f404-d1e6-4f65-b614-b2224176019a	06e7b816-1d64-405c-a9c9-9acdc6b94ea0	137b371c-3c0a-4286-951b-7c61ffed74fe	helsdlow	TEXT	SENT	1.0	f	2026-03-29 17:15:29.23	\N	\N
03507bc0-7ad6-4a8f-9192-3ff07ff4819d	06e7b816-1d64-405c-a9c9-9acdc6b94ea0	89733fd7-a7a1-4339-aa67-6968ea97908a	second msg	TEXT	SENT	1.0	f	2026-03-29 17:16:35.512	\N	\N
235eb56d-9240-4133-8b33-39c817a1a4b8	06e7b816-1d64-405c-a9c9-9acdc6b94ea0	89733fd7-a7a1-4339-aa67-6968ea97908a	second msg	TEXT	SENT	1.0	f	2026-03-29 17:16:45.123	\N	\N
cf21245e-6bfc-49f5-b738-cf08a1d38d1c	06e7b816-1d64-405c-a9c9-9acdc6b94ea0	137b371c-3c0a-4286-951b-7c61ffed74fe	helsdlow	TEXT	SENT	1.0	f	2026-03-29 17:27:08.531	\N	\N
6c1a1aaa-3f86-4829-b926-dd0cbba278c4	06e7b816-1d64-405c-a9c9-9acdc6b94ea0	137b371c-3c0a-4286-951b-7c61ffed74fe	helsdlow	TEXT	SENT	1.0	f	2026-03-29 17:28:38.569	\N	\N
d63d5add-d1f5-4a80-8d0b-a7d94c618981	06e7b816-1d64-405c-a9c9-9acdc6b94ea0	137b371c-3c0a-4286-951b-7c61ffed74fe	helsdlow	TEXT	SENT	1.0	f	2026-03-29 17:29:01.687	\N	\N
0b1b51c9-914d-4541-a672-3db2ce2104a6	06e7b816-1d64-405c-a9c9-9acdc6b94ea0	89733fd7-a7a1-4339-aa67-6968ea97908a	hello to sencond user	TEXT	SENT	1.0	f	2026-03-29 17:50:17.749	\N	\N
a4c9cb9f-724c-4e9e-9339-86c380c7a1f5	06e7b816-1d64-405c-a9c9-9acdc6b94ea0	89733fd7-a7a1-4339-aa67-6968ea97908a	hello aslam bsdk	TEXT	SENT	1.0	f	2026-03-30 05:38:23.91	\N	\N
64c7e41c-fcac-4fdd-908b-89ee6ed16698	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	helloww. 	TEXT	SENT	1.0	f	2026-04-08 11:28:42.425	\N	\N
ccd25c43-fe69-4ba6-9320-d1854efe8460	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	hiiiiiiiii	TEXT	SENT	1.0	f	2026-04-08 11:28:46.716	\N	\N
b151ac3e-7443-4421-9c1b-d0df21a9a598	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	from deejey\n	TEXT	SENT	1.0	f	2026-04-08 11:48:33.078	\N	\N
5ba22cd0-4c20-40bc-88d1-c67017c65064	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	fasdfasd	TEXT	SENT	1.0	f	2026-04-08 11:51:31.243	\N	\N
964bf596-fc4b-46ff-ae63-cbbfcc2e97db	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	\n\n\n\nasdf	TEXT	SENT	1.0	f	2026-04-08 11:51:34.975	\N	\N
45c63e1b-145f-4046-b93b-2406dd970547	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	adsf\nadsf	TEXT	SENT	1.0	f	2026-04-08 11:51:40.01	\N	\N
f8750d57-d5f7-4391-8d59-aeb8fd22fddb	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	fsdf\n\nfdasf\n\nadfads	TEXT	SENT	1.0	f	2026-04-08 11:51:47.244	\N	\N
e43cd8b3-5210-4aac-bfe9-c8943685d05a	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	asdf	TEXT	SENT	1.0	f	2026-04-08 12:14:12.514	\N	\N
cbcfce84-c60a-471c-bd95-c49f4842cc33	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	hey	TEXT	SENT	1.0	f	2026-04-08 19:25:12.841	\N	\N
4041efdc-2579-44c7-aeb7-34c7aea07a34	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	he	TEXT	SENT	1.0	f	2026-04-08 19:25:18.359	\N	\N
d32350e9-9e38-430a-84d7-3663f0dfbc76	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	asd	TEXT	SENT	1.0	f	2026-04-08 19:25:19.065	\N	\N
f45d23eb-a8c5-4c3b-b4d1-68cfaa774024	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	asd	TEXT	SENT	1.0	f	2026-04-08 19:25:19.472	\N	\N
13e0fe71-3c2f-4723-a59e-e58c7d284406	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	fasd	TEXT	SENT	1.0	f	2026-04-08 19:25:19.788	\N	\N
396db2a8-7583-4b44-a6e9-0ff0860fbfd0	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	f	TEXT	SENT	1.0	f	2026-04-08 19:25:19.98	\N	\N
0a11b649-e97d-415d-822a-8c828472db65	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	asd	TEXT	SENT	1.0	f	2026-04-08 19:25:20.196	\N	\N
18732f8e-9fb4-4b78-b04a-35b2e6b1a582	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	f	TEXT	SENT	1.0	f	2026-04-08 19:25:20.381	\N	\N
f52a4381-cd11-4fa8-80c0-3b96d6070262	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	asd	TEXT	SENT	1.0	f	2026-04-08 19:25:20.586	\N	\N
abb80df7-a7ab-4454-9bab-c69378b99fa5	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	f	TEXT	SENT	1.0	f	2026-04-08 19:25:20.781	\N	\N
303ab9a2-95cc-4332-b3f0-5fa0993cff6d	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	asd	TEXT	SENT	1.0	f	2026-04-08 19:25:20.975	\N	\N
a86ab66c-81b8-4210-b08c-4c383ca178b3	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	f	TEXT	SENT	1.0	f	2026-04-08 19:25:21.178	\N	\N
17536991-052c-4bb2-9b0d-b3cf0b249b32	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	asd	TEXT	SENT	1.0	f	2026-04-08 19:25:21.382	\N	\N
6954df3f-3b42-4993-b493-e0981e2a458e	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	adfds	TEXT	SENT	1.0	f	2026-04-08 19:25:22.681	\N	\N
23223508-54f9-4312-b838-bec250817fa0	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	dsf	TEXT	SENT	1.0	f	2026-04-08 19:25:37.253	\N	\N
420c116a-9adc-4eb7-b110-da9367a7f151	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	sdd	TEXT	SENT	1.0	f	2026-04-08 19:25:49.073	\N	\N
844ff9b8-31ee-4b8a-8f81-b5f7bcedb55a	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	hey	TEXT	SENT	1.0	f	2026-04-08 19:26:16.197	\N	\N
2f4666e5-831a-45aa-96b9-b077135f3337	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	hey	TEXT	SENT	1.0	f	2026-04-08 19:26:17.966	\N	\N
314f5507-3a17-4250-b47f-d54f98a4d2c1	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	hey	TEXT	SENT	1.0	f	2026-04-08 19:26:18.982	\N	\N
e2394754-e995-4519-a3c8-7904769b5748	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	hey	TEXT	SENT	1.0	f	2026-04-08 19:26:20.001	\N	\N
1addf876-72ec-4f03-a9a7-98817afea7d3	b7cecbae-f238-40e5-a63c-096559167f0d	d608872c-f9b5-48e0-a41e-4bb0a591a49f	f	TEXT	SENT	1.0	f	2026-04-08 19:27:04.034	\N	\N
e9dceece-318a-424f-8c79-71d0dd9043e3	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	f	TEXT	SENT	1.0	f	2026-04-08 19:27:42.112	\N	\N
930b901d-66df-4852-a0ee-0bbdcffeb775	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	f	TEXT	SENT	1.0	f	2026-04-08 19:27:42.366	\N	\N
6b958d21-dab0-4d86-b827-bdda6a9db2d1	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	f	TEXT	SENT	1.0	f	2026-04-08 19:27:42.598	\N	\N
06144799-205d-4119-82f3-d34f77fda7b3	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	f	TEXT	SENT	1.0	f	2026-04-08 19:27:42.818	\N	\N
b1f88aa9-2f2e-4547-8820-339b174846eb	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	f	TEXT	SENT	1.0	f	2026-04-08 19:27:43.03	\N	\N
a36832b4-f169-454d-b5e6-0236ac903bf5	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	f	TEXT	SENT	1.0	f	2026-04-08 19:27:43.568	\N	\N
2d0fdc97-a49a-4553-80bb-249e663091d5	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	f	TEXT	SENT	1.0	f	2026-04-08 19:27:43.966	\N	\N
1f4a4868-ca7a-4965-9f48-b0d704269217	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	f	TEXT	SENT	1.0	f	2026-04-08 19:27:44.166	\N	\N
ab10b9ce-dc58-4cf7-8566-6b5298f44246	b7cecbae-f238-40e5-a63c-096559167f0d	89733fd7-a7a1-4339-aa67-6968ea97908a	f	TEXT	SENT	1.0	f	2026-04-08 19:27:44.366	\N	\N


--
-- Data for Name: RefreshToken; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RefreshToken" (id, "userId", "tokenHash", "expiresAt", "revokedAt", "createdAt", "updatedAt") FROM stdin;
df0c9be1-d1da-4259-934d-4541cd5482a0	89733fd7-a7a1-4339-aa67-6968ea97908a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTczM2ZkNy1hN2ExLTQzMzktYWE2Ny02OTY4ZWE5NzkwOGEiLCJ1aWQiOiJjOTRiNDExNjkyMGEzNTcwZTEwOTFmYTMxZjA1NWRkM2UwN2ZmMGMzMzkzZDk2MmIzNTVhYTcwNjEwN2MxOTgzIiwibmFtZSI6ImRlZWpleSIsImlhdCI6MTc3NDcxMjc1NywiZXhwIjoxNzc3MzA0NzU3fQ.7EUmkWdaCMj3GIFnI63KlmmMD6q368nbidWnSN797n4	2026-04-27 15:45:57.548	\N	2026-03-28 15:45:57.554	2026-03-28 15:45:57.554
a541f6dc-9e5c-4695-93ba-666a80b3063c	77561ade-cfe5-450b-a2b0-9cf468910dec	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NzU2MWFkZS1jZmU1LTQ1MGItYTJiMC05Y2Y0Njg5MTBkZWMiLCJ1aWQiOiJkYzA2ZTY1N2NjMDc3MGVlYWM0OWZmZTAzNjY5NzJiMWM2YzYwZjcwZWQ5N2Q4MmQ0Njg3NWFmYTYzMTBhZTYzIiwibmFtZSI6ImRvY2tlciIsImlhdCI6MTc3NDcyMDI4MiwiZXhwIjoxNzc3MzEyMjgyfQ.Sz8coEexo4F8nVdB6F6BZBmSKDVm9gcm0YFDcK-XUl0	2026-04-27 17:51:22.484	\N	2026-03-28 17:51:22.488	2026-03-28 17:51:22.488
2e1d6bf0-706c-4be1-96ee-f7621bdb5f9a	137b371c-3c0a-4286-951b-7c61ffed74fe	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMzdiMzcxYy0zYzBhLTQyODYtOTUxYi03YzYxZmZlZDc0ZmUiLCJ1aWQiOiJhYWI4MDgxNjU3ZTMxMjZmMTc2MDMxYWViMDJiY2U3Yzg5ZTU5ZjRlY2MwNWNjYTMwZjI3YmJhZDAyYjQ3OTFjIiwibmFtZSI6ImxpemEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDc5NzY1OCwiZXhwIjoxNzc3Mzg5NjU4fQ.rbg6lfE2bxg2mXYDwRxjvz293Hr_DFFEqYszWM3L7_0	2026-04-28 15:20:58.009	\N	2026-03-29 15:20:58.011	2026-03-29 15:20:58.011
76207c5d-1241-4bc4-a880-aacf1446bc03	89733fd7-a7a1-4339-aa67-6968ea97908a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTczM2ZkNy1hN2ExLTQzMzktYWE2Ny02OTY4ZWE5NzkwOGEiLCJ1aWQiOiJjOTRiNDExNjkyMGEzNTcwZTEwOTFmYTMxZjA1NWRkM2UwN2ZmMGMzMzkzZDk2MmIzNTVhYTcwNjEwN2MxOTgzIiwibmFtZSI6ImRlZWpleSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc0ODAxNzk2LCJleHAiOjE3NzczOTM3OTZ9.Ir-5RdLUu0_PaRTf2p2IiujOwy8u2cKEFKabVd1lppk	2026-04-28 16:29:56.399	\N	2026-03-29 16:29:56.403	2026-03-29 16:29:56.403
28a0cdc8-d83c-49c9-9376-a328c8e510ae	89733fd7-a7a1-4339-aa67-6968ea97908a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTczM2ZkNy1hN2ExLTQzMzktYWE2Ny02OTY4ZWE5NzkwOGEiLCJ1aWQiOiJjOTRiNDExNjkyMGEzNTcwZTEwOTFmYTMxZjA1NWRkM2UwN2ZmMGMzMzkzZDk2MmIzNTVhYTcwNjEwN2MxOTgzIiwibmFtZSI6ImRlZWpleSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc1MzI4NDIzLCJleHAiOjE3Nzc5MjA0MjN9.hUPCZTZbjUVC5CCVL3qupFbb0Y3DsZu8JQ-z0dImqbA	2026-05-04 18:47:03.737	\N	2026-04-04 18:47:03.743	2026-04-04 18:47:03.743
62eca916-db8a-446a-add0-12f8eff4dddf	89733fd7-a7a1-4339-aa67-6968ea97908a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTczM2ZkNy1hN2ExLTQzMzktYWE2Ny02OTY4ZWE5NzkwOGEiLCJ1aWQiOiJjOTRiNDExNjkyMGEzNTcwZTEwOTFmYTMxZjA1NWRkM2UwN2ZmMGMzMzkzZDk2MmIzNTVhYTcwNjEwN2MxOTgzIiwibmFtZSI6ImRlZWpleSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc1MzMwMzAxLCJleHAiOjE3Nzc5MjIzMDF9.xw_7TACqkvjTEUEKFdlzlObpmnla9b33Z5SQ1TYe340	2026-05-04 19:18:21.862	\N	2026-04-04 19:18:21.866	2026-04-04 19:18:21.866
2638a4de-5d9a-4a1d-bfe1-3a4bcd1258af	d608872c-f9b5-48e0-a41e-4bb0a591a49f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkNjA4ODcyYy1mOWI1LTQ4ZTAtYTQxZS00YmIwYTU5MWE0OWYiLCJ1aWQiOiJhOTczMjY3OTYyODcwNTk3MTY0MDM3Mjg4MWIzYmE1ZDkxNDQ4NDdmZmJjZTYwOTZjNGMxMDEzMDk1Y2Y1YWZjIiwibmFtZSI6InNpbWkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NTM3NTQ3OSwiZXhwIjoxNzc3OTY3NDc5fQ.eaCqosxUR9o7m2bO9cZzOJh9NMHKSTg17Dy6X36ixns	2026-05-05 07:51:19.3	\N	2026-04-05 07:51:19.302	2026-04-05 07:51:19.302
48b7426b-c1ab-4a3c-8485-1ed1f0b23e64	89733fd7-a7a1-4339-aa67-6968ea97908a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTczM2ZkNy1hN2ExLTQzMzktYWE2Ny02OTY4ZWE5NzkwOGEiLCJ1aWQiOiJjOTRiNDExNjkyMGEzNTcwZTEwOTFmYTMxZjA1NWRkM2UwN2ZmMGMzMzkzZDk2MmIzNTVhYTcwNjEwN2MxOTgzIiwibmFtZSI6ImRlZWpleSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc1Mzc1NzQzLCJleHAiOjE3Nzc5Njc3NDN9.y8ZpNJNQgmbU-ifm5HYji6JT5fmgAF8YSV7lvUA4GcU	2026-05-05 07:55:43.936	\N	2026-04-05 07:55:43.936	2026-04-05 07:55:43.936
0db20b1c-ee62-48b8-840d-20ae67f820ba	89733fd7-a7a1-4339-aa67-6968ea97908a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTczM2ZkNy1hN2ExLTQzMzktYWE2Ny02OTY4ZWE5NzkwOGEiLCJ1aWQiOiJjOTRiNDExNjkyMGEzNTcwZTEwOTFmYTMxZjA1NWRkM2UwN2ZmMGMzMzkzZDk2MmIzNTVhYTcwNjEwN2MxOTgzIiwibmFtZSI6ImRlZWpleSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc1Mzc1OTY3LCJleHAiOjE3Nzc5Njc5Njd9.ncgU7mfzqj5v3RpgTtez4RQptm5SB3xlVV6mm6QGbfA	2026-05-05 07:59:27.195	\N	2026-04-05 07:59:27.195	2026-04-05 07:59:27.195
ff84ca2e-4332-46f2-b958-58eb0b31c013	89733fd7-a7a1-4339-aa67-6968ea97908a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTczM2ZkNy1hN2ExLTQzMzktYWE2Ny02OTY4ZWE5NzkwOGEiLCJ1aWQiOiJjOTRiNDExNjkyMGEzNTcwZTEwOTFmYTMxZjA1NWRkM2UwN2ZmMGMzMzkzZDk2MmIzNTVhYTcwNjEwN2MxOTgzIiwibmFtZSI6ImRlZWpleSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc1NDc2MTQwLCJleHAiOjE3NzgwNjgxNDB9.hXurR0fDbVmUTHc5Vvfi6D_QMdvHWmi9azsyJbyTAhk	2026-05-06 11:49:00.804	\N	2026-04-06 11:49:00.809	2026-04-06 11:49:00.809
3fbaa69a-0b3e-45dc-b33b-201c8d5cf33e	89733fd7-a7a1-4339-aa67-6968ea97908a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTczM2ZkNy1hN2ExLTQzMzktYWE2Ny02OTY4ZWE5NzkwOGEiLCJ1aWQiOiJjOTRiNDExNjkyMGEzNTcwZTEwOTFmYTMxZjA1NWRkM2UwN2ZmMGMzMzkzZDk2MmIzNTVhYTcwNjEwN2MxOTgzIiwibmFtZSI6ImRlZWpleSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc1NTgwMDY2LCJleHAiOjE3NzgxNzIwNjZ9.eXoT7Auz5tPQInyAxbt7O9XBG9xq33ITNRVOBnekG6s	2026-05-07 16:41:06.35	\N	2026-04-07 16:41:06.355	2026-04-07 16:41:06.355
a03c92f6-257a-4c1c-a1c9-79806809efdb	d608872c-f9b5-48e0-a41e-4bb0a591a49f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkNjA4ODcyYy1mOWI1LTQ4ZTAtYTQxZS00YmIwYTU5MWE0OWYiLCJ1aWQiOiJhOTczMjY3OTYyODcwNTk3MTY0MDM3Mjg4MWIzYmE1ZDkxNDQ4NDdmZmJjZTYwOTZjNGMxMDEzMDk1Y2Y1YWZjIiwibmFtZSI6InNpbWkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NTYzNDg2MywiZXhwIjoxNzc4MjI2ODYzfQ.azeqFRwhOG4ThMbnCINFrDQBuFZKkU9jwPkVbWNG-cs	2026-05-08 07:54:23.234	\N	2026-04-08 07:54:23.239	2026-04-08 07:54:23.239
ce8b61fd-92f8-4cb7-a161-fc2db1611d4e	d608872c-f9b5-48e0-a41e-4bb0a591a49f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkNjA4ODcyYy1mOWI1LTQ4ZTAtYTQxZS00YmIwYTU5MWE0OWYiLCJ1aWQiOiJhOTczMjY3OTYyODcwNTk3MTY0MDM3Mjg4MWIzYmE1ZDkxNDQ4NDdmZmJjZTYwOTZjNGMxMDEzMDk1Y2Y1YWZjIiwibmFtZSI6InNpbWkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NTY0MzgzMywiZXhwIjoxNzc4MjM1ODMzfQ.YF1XpPzlDjCe1rb7UcY0k-n1_CuPYPF7AQaqRQYaOFo	2026-05-08 10:23:53.504	\N	2026-04-08 10:23:53.508	2026-04-08 10:23:53.508
5383c37a-8fe9-4251-bb3b-e0dd377f062a	89733fd7-a7a1-4339-aa67-6968ea97908a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTczM2ZkNy1hN2ExLTQzMzktYWE2Ny02OTY4ZWE5NzkwOGEiLCJ1aWQiOiJjOTRiNDExNjkyMGEzNTcwZTEwOTFmYTMxZjA1NWRkM2UwN2ZmMGMzMzkzZDk2MmIzNTVhYTcwNjEwN2MxOTgzIiwibmFtZSI6ImRlZWpleSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc1Njc0ODI0LCJleHAiOjE3NzgyNjY4MjR9.plVcRDyrTHZ-5kOI6EHfhKaxIIORQpz_dmusoCtKtMM	2026-05-08 19:00:24.454	\N	2026-04-08 19:00:24.459	2026-04-08 19:00:24.459
269bcc09-6493-4c31-b37d-d0c329973add	89733fd7-a7a1-4339-aa67-6968ea97908a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTczM2ZkNy1hN2ExLTQzMzktYWE2Ny02OTY4ZWE5NzkwOGEiLCJ1aWQiOiJjOTRiNDExNjkyMGEzNTcwZTEwOTFmYTMxZjA1NWRkM2UwN2ZmMGMzMzkzZDk2MmIzNTVhYTcwNjEwN2MxOTgzIiwibmFtZSI6ImRlZWpleSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc1Njc1MzQwLCJleHAiOjE3NzgyNjczNDB9.8IeXiVT7sEmBBcoGuj_FWzlUC4gB53ll0C1NU4t5wEc	2026-05-08 19:09:00.455	\N	2026-04-08 19:09:00.46	2026-04-08 19:09:00.46
8862fceb-2a33-4afd-89dc-904fdd9b958b	89733fd7-a7a1-4339-aa67-6968ea97908a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTczM2ZkNy1hN2ExLTQzMzktYWE2Ny02OTY4ZWE5NzkwOGEiLCJ1aWQiOiJjOTRiNDExNjkyMGEzNTcwZTEwOTFmYTMxZjA1NWRkM2UwN2ZmMGMzMzkzZDk2MmIzNTVhYTcwNjEwN2MxOTgzIiwibmFtZSI6ImRlZWpleSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc1Njc1NDIzLCJleHAiOjE3NzgyNjc0MjN9.ZhtSTOAFbWGE0Uz0C5PzJwf4Z2YIkEC4bJvmoHdq2h0	2026-05-08 19:10:23.611	\N	2026-04-08 19:10:23.616	2026-04-08 19:10:23.616
3a3cb6b6-4e48-41b2-82ad-b04c8885402b	89733fd7-a7a1-4339-aa67-6968ea97908a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTczM2ZkNy1hN2ExLTQzMzktYWE2Ny02OTY4ZWE5NzkwOGEiLCJ1aWQiOiJjOTRiNDExNjkyMGEzNTcwZTEwOTFmYTMxZjA1NWRkM2UwN2ZmMGMzMzkzZDk2MmIzNTVhYTcwNjEwN2MxOTgzIiwibmFtZSI6ImRlZWpleSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc1Njc1NDg1LCJleHAiOjE3NzgyNjc0ODV9.s5OTxr1Y0nKA-iIj5cGewfTJLJpVOs02yI_zNlVcZz8	2026-05-08 19:11:25.614	\N	2026-04-08 19:11:25.614	2026-04-08 19:11:25.614
5255cf3c-5979-414a-96ea-354568ba08a9	89733fd7-a7a1-4339-aa67-6968ea97908a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTczM2ZkNy1hN2ExLTQzMzktYWE2Ny02OTY4ZWE5NzkwOGEiLCJ1aWQiOiJjOTRiNDExNjkyMGEzNTcwZTEwOTFmYTMxZjA1NWRkM2UwN2ZmMGMzMzkzZDk2MmIzNTVhYTcwNjEwN2MxOTgzIiwibmFtZSI6ImRlZWpleSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzc1Njc1NjE0LCJleHAiOjE3NzgyNjc2MTR9.Nf7ahn00D6qEb-ivfw_mPi-u7-_1UEXvXuP_OdVfWrY	2026-05-08 19:13:34.653	\N	2026-04-08 19:13:34.654	2026-04-08 19:13:34.654
5336e095-5162-4528-8069-a85e97623e27	d608872c-f9b5-48e0-a41e-4bb0a591a49f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkNjA4ODcyYy1mOWI1LTQ4ZTAtYTQxZS00YmIwYTU5MWE0OWYiLCJ1aWQiOiJhOTczMjY3OTYyODcwNTk3MTY0MDM3Mjg4MWIzYmE1ZDkxNDQ4NDdmZmJjZTYwOTZjNGMxMDEzMDk1Y2Y1YWZjIiwibmFtZSI6InNpbWkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NTY3NjMwNywiZXhwIjoxNzc4MjY4MzA3fQ.GoKkFTD_39xEj9usUN09iw_zchC8AQgfVlshiTuB9Is	2026-05-08 19:25:07.696	\N	2026-04-08 19:25:07.697	2026-04-08 19:25:07.697


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, "displayName", "uniqueUserId", "recoveryKeyFingerprint", "recoveryKeyHash", "createdAt", "updatedAt") FROM stdin;
89733fd7-a7a1-4339-aa67-6968ea97908a	deejey	c94b4116920a3570e1091fa31f055dd3e07ff0c3393d962b355aa706107c1983	4a3fe22ee7b62fe3	$2b$12$ClmrUlshVrFf9LQRzDnrkeIkrvRdDTd7rAApf1LM5XctRPmW.yB1K	2026-03-20 12:30:09.943	2026-03-20 12:30:09.943
f2f7d01e-bcd4-42e3-8413-16f2eba686dd	dhan	5b2d15248197431624151a52902d37315bc9cd0ea283ec8236afd0265af538a3	63f1024bc5a2a1c7	$2b$12$LMM72dZpwhOy/ckf5CqUgu16ZwVXR1M3hKTV7nAlJ13hqCRsXuZ4O	2026-03-20 12:35:01.766	2026-03-20 12:35:01.766
27c19ee1-ad96-41c5-9667-75e10d289450	test	667ff7bca625dfb3ee81a4374dd22035c7bd4391b296ca751e760f827ec50b46	44c9ecc8811a4849	$2b$12$AhAupV3/UlwID7FdxwBnVuKpVPfunHFxtSe14wtNvy3.AbF.7rlvS	2026-03-21 18:34:06.896	2026-03-21 18:34:06.896
8b9e13f6-d77e-465a-9ff1-4617ad1dc175	darshan	6f9169a2cf2cc1af1af89345cbf627e13c0739d41c4085c8dd2804bf598511a0	3b3b8dc781c008ed	$2b$12$PDVvk0FmImJqMYQtpSfoMeuigyO0LYGd.geWK5pDI//aK2W8ZTqRW	2026-03-24 06:49:35.701	2026-03-24 06:49:35.701
48d0541b-c8f7-4d9c-aa7a-d5efe22581d3	naam	45d559d25a844c58004c9e89ed78173f940ecee2712de2683a524333caaae823	0c421541f503944c	$2b$12$lTaRM2b9CU7wueC/KjDrO.90mVFg3kYMceFipJqmXJAeFyVrjQmc.	2026-03-24 07:11:29.614	2026-03-24 07:11:29.614
c107fd10-6810-4cfb-b15c-d508e575a946	naam	00908d19a4eccf977850d724b74bdaccf3a0dfaa1eeafb8a70a2f9c78841784e	0069783d53e9d299	$2b$12$m7gGNrrpTj2NmKZrBQCuCOnmUcfhx16M3F/.iLTKkgiDn2SzA.t76	2026-03-24 07:12:46.671	2026-03-24 07:12:46.671
d6f4f37c-e4e6-45c5-8303-30f21353043f	safeuser	6c197c256f26aa85fd2160fb39d634371c930fb39d715bb2972581207ef1f2d2	878e5b0bf364c52f	$2b$12$txRXwLPzJ9MDeXQvzGdUEuYokHg95Yd.M6f/W5EaPbkB/BoD0GFGC	2026-03-26 11:45:39.506	2026-03-26 11:45:39.506
b28a0ec8-44d7-4cf6-903d-7ac15da0c0c6	asdfasdfasdf	f3e9b2b956758ea4974728b8cb92079e887f71b8ce2c926201744f372f8883a3	67ac451163b38451	$2b$12$2WnfJezMqL/2y8ZPZ4PZVuK3TOPJJGlPxhvapF.zmMeEevjkujn6O	2026-03-26 11:48:28.586	2026-03-26 11:48:28.586
77561ade-cfe5-450b-a2b0-9cf468910dec	docker	dc06e657cc0770eeac49ffe0366972b1c6c60f70ed97d82d46875afa6310ae63	b3c0258430506e23	$2b$12$xetI7h61OWmuIXQfCgTgi.kjoaTJmLhYd3GCg4DLBP.Ov8182t3PK	2026-03-28 17:51:22.429	2026-03-28 17:51:22.429
137b371c-3c0a-4286-951b-7c61ffed74fe	liza	aab8081657e3126f176031aeb02bce7c89e59f4ecc05cca30f27bbad02b4791c	37b4b1c81897e784	$2b$12$XDdPT6VG8ikyC/q.Ml91CehcS3sngESRzxhCRJUCM8Vvc15iM5nGy	2026-03-29 15:20:57.957	2026-03-29 15:20:57.957
d608872c-f9b5-48e0-a41e-4bb0a591a49f	simi	a9732679628705971640372881b3ba5d9144847ffbce6096c4c1013095cf5afc	3d89fde3771cf4b7	$2b$12$8XvpIjyQlMdKXSofWHbYsOLEWLL/x52WlxZWbKXi1zOyxDp7tWxpC	2026-04-05 07:51:19.255	2026-04-05 07:51:19.255


--
-- Data for Name: UserIdentityKey; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserIdentityKey" (id, "userId", "registrationId", "publicKey", "createdAt", "updatedAt") FROM stdin;


--
-- Data for Name: UserOneTimePreKey; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserOneTimePreKey" (id, "userId", "keyId", "publicKey", "isUsed", "usedAt", "createdAt") FROM stdin;


--
-- Data for Name: UserSignedPreKey; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserSignedPreKey" (id, "userId", "keyId", "publicKey", signature, "isActive", "createdAt", "updatedAt", "expiresAt") FROM stdin;


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1feb2d86-54d0-4203-a732-2ed625918bc3	6b60d6c43b74d5b7e850f18ae02adf2fba1085724535653ed66fa32256076a51	2026-03-17 14:17:09.973247+00	20260317141709_first	\N	\N	2026-03-17 14:17:09.943164+00	1


--
-- Name: ConversationMember ConversationMember_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ConversationMember"
    ADD CONSTRAINT "ConversationMember_pkey" PRIMARY KEY (id);


--
-- Name: Conversation Conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: RefreshToken RefreshToken_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY (id);


--
-- Name: UserIdentityKey UserIdentityKey_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserIdentityKey"
    ADD CONSTRAINT "UserIdentityKey_pkey" PRIMARY KEY (id);


--
-- Name: UserOneTimePreKey UserOneTimePreKey_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserOneTimePreKey"
    ADD CONSTRAINT "UserOneTimePreKey_pkey" PRIMARY KEY (id);


--
-- Name: UserSignedPreKey UserSignedPreKey_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserSignedPreKey"
    ADD CONSTRAINT "UserSignedPreKey_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ConversationMember_conversationId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ConversationMember_conversationId_userId_key" ON public."ConversationMember" USING btree ("conversationId", "userId");


--
-- Name: Conversation_directConversationKey_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Conversation_directConversationKey_key" ON public."Conversation" USING btree ("directConversationKey");


--
-- Name: Message_conversationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_conversationId_idx" ON public."Message" USING btree ("conversationId");


--
-- Name: Message_senderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_senderId_idx" ON public."Message" USING btree ("senderId");


--
-- Name: RefreshToken_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RefreshToken_userId_idx" ON public."RefreshToken" USING btree ("userId");


--
-- Name: UserIdentityKey_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserIdentityKey_userId_key" ON public."UserIdentityKey" USING btree ("userId");


--
-- Name: UserOneTimePreKey_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserOneTimePreKey_userId_idx" ON public."UserOneTimePreKey" USING btree ("userId");


--
-- Name: UserSignedPreKey_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserSignedPreKey_userId_idx" ON public."UserSignedPreKey" USING btree ("userId");


--
-- Name: User_recoveryKeyFingerprint_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_recoveryKeyFingerprint_key" ON public."User" USING btree ("recoveryKeyFingerprint");


--
-- Name: User_uniqueUserId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_uniqueUserId_key" ON public."User" USING btree ("uniqueUserId");


--
-- Name: ConversationMember ConversationMember_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ConversationMember"
    ADD CONSTRAINT "ConversationMember_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ConversationMember ConversationMember_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ConversationMember"
    ADD CONSTRAINT "ConversationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RefreshToken RefreshToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserIdentityKey UserIdentityKey_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserIdentityKey"
    ADD CONSTRAINT "UserIdentityKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserOneTimePreKey UserOneTimePreKey_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserOneTimePreKey"
    ADD CONSTRAINT "UserOneTimePreKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserSignedPreKey UserSignedPreKey_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserSignedPreKey"
    ADD CONSTRAINT "UserSignedPreKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


