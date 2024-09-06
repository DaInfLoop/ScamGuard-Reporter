import { Client, GatewayIntentBits, Events, type Snowflake, TextChannel, codeBlock, time } from "discord.js";

const REPORT_CHANNEL_ID = '1187576332972986418'; // #staff-bots
const MOD_PING_ROLE = '1187570523060850768'; // Royal Guard

type BanInfo = {
    banned: boolean;
    user_id: Snowflake;
    valid: boolean;
    banned_on: string; // ISO date
    banned_by: string;
}

async function checkUser(id: Snowflake): Promise<BanInfo> {
    const response = await fetch(`https://api.scamguard.app/ban/${id}`, {
        headers: {
            'Authorization': `Bearer ${process.env.SCAMGUARD_TOKEN}`
        }
    }).then(res => res.json())


    return response
}

const client = new Client({ intents: [ GatewayIntentBits.GuildMembers ] });

client.on(Events.ClientReady, () => {
    console.log(`Hmmm... oh hello! My name is ${client.user!.tag} and I'm online now at ${new Date().toISOString()}!`)

    client.channels.fetch(REPORT_CHANNEL_ID)
})

client.on(Events.GuildMemberAdd, async (member) => {
    if (member.user.bot) return;

    const scamguardResponse = await checkUser(member.id);

    if (scamguardResponse.banned) {
        const reportChannel = client.channels.cache.get(REPORT_CHANNEL_ID) as TextChannel;

        reportChannel.send({
            content: `<@&${MOD_PING_ROLE}>`,
            embeds: [
                {
                    title: "Reported user joined!",
                    thumbnail: { url: member.displayAvatarURL({ size: 1024, forceStatic: true }) },
                    fields: [
                        {
                            name: "Username",
                            value: member.user.username,
                            inline: true
                        },
                        {
                            name: "User mention",
                            value: `<@${member.id}>`,
                            inline: true
                        },
                        {
                            name: "Banned At",
                            value: time(new Date(scamguardResponse.banned_on), "f")
                        },
                        {
                            name: "Pre-filled ban command",
                            value: `pls ban ${member.id} Potential scammer`
                        }
                    ],
                    footer: { text: "Brought to you by ScamGuard" },
                    color: 0xFF0000
                }
            ]
        })
    }
});

client.login(process.env.DISCORD_TOKEN);