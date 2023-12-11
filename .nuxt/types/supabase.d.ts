declare module '#supabase/server' {
  const serverSupabaseClient: typeof import('/app/node_modules/@nuxtjs/supabase/dist/runtime/server/services').serverSupabaseClient
  const serverSupabaseServiceRole: typeof import('/app/node_modules/@nuxtjs/supabase/dist/runtime/server/services').serverSupabaseServiceRole
  const serverSupabaseUser: typeof import('/app/node_modules/@nuxtjs/supabase/dist/runtime/server/services').serverSupabaseUser
}