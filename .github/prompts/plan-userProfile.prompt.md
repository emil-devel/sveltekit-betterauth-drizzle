Mein nächstes Ziel/Plan ist die Anpassung der Tabelle 'user' und die Erstellung der Tabelle 'profile'. Dabei sollen die Better-Auth Regel strickt berücksichtigen werden (Tabelle um Felder erweitern, Tabellenfelder umbenennen, etc.).

1. Tabelle 'user' um die Felder 'active' und 'role' erweitern. Das Feld 'active' soll von Type boolean sein:

   active: boolean('active').default(true).notNull(),
   role: roleEnum('role').default('USER').notNull(),

und als const exportieren:

    export const roleEnum = pgEnum('Role', ['USER', 'REDACTEUR', 'ADMIN']);

2. Für alle Änderungen (1. - 4.) die 'auth.ts' Datei entsprechend die Better-Auth patten ergänzen.
3. Die Tabelle 'profile' erstellen:

   export const profile = pgTable('profile', {
   id: uuid('id').defaultRandom().primaryKey(),
   firstName: text('firstName'),
   lastName: text('lastName'),
   phone: text('phone'),
   bio: text('bio'),
   userId: text('user_id')
   .references(() => user.id, { onUpdate: 'cascade', onDelete: 'cascade' })
   .notNull()
   });

4. Export die Relations const:

export const profileRelations = relations(profile, ({ one }) => ({
user: one(user, { fields: [profile.userId], references: [user.id] })
}));
