import { createError } from 'h3'
import type { Database } from '~~/types/database.types'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler( async (event) => {
    const client = await serverSupabaseClient<Database>(event)

    const { data, error } = await client.from('random_eesti_words').select('eesti_name, grammar')
    if (error) {
        throw createError({ statusMessage: error.message })
    }
    return data;
});