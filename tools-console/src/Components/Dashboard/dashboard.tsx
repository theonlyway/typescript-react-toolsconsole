import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import {
    Box,
    Container,
    Grid,
    Paper,
    Button
} from "@material-ui/core";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Label,
    Tooltip,
    Legend
} from "recharts";
import { API, Auth } from 'aws-amplify';
import { useAppSelector } from '../../redux/hooks'
import { DefaultStyles } from '../../styles/common'

// Generate Sales Data
function createData(time: string, contestName: string, rating: number, rank: number) {
    const dataObject = {
        time: time,
        contestName: contestName,
        rating: rating,
        rank: rank,
        tier: getTier(rating)
    };
    return dataObject;
}

function getTier(rating: number) {
    if (rating < 1199) return "newbie";
    else if (rating < 1399) return "pupil";
    else if (rating < 1599) return "specialist";
    else if (rating < 1899) return "expert";
    else if (rating < 2099) return "candidate master";
    else if (rating < 2299) return "master";
    else if (rating < 2399) return "international master";
    else if (rating < 2599) return "grandmaster";
    else if (rating < 2999) return "international grandmaster";
    else return "legendary grandmaster";
}
const data = [
    createData("Oct 2019", "Codeforces Round #639", 1350, 4234),
    createData("Nov 2019", "Codeforces Round #641", 1393, 1434),
    createData("Dec 2019", "Codeforces Round #643", 1211, 6783),
    createData("Jan 2020", "Codeforces Round #644", 300, 678),
    createData("Feb 2020", "Codeforces Round #646", 1450, 1345),
    createData("Mar 2020", "Codeforces Round #648", 1581, 1456),
    createData("Apr 2020", "Codeforces Round #649", 1511, 3500)
];

interface IProps {
    pageTitle: string
}

export default function Dashboard(props: IProps) {
    const theme = useTheme();
    // eslint-disable-next-line no-unused-vars
    const [pageTitle, setPageTitle] = useState(props.pageTitle)

    const useStyles = makeStyles((theme) => ({
        fixedHeight: {
            height: 400
        }
    }));
    const classes = useStyles();
    const defaultClasses = DefaultStyles()
    const open = useAppSelector(state => state.generalState.drawerOpen);

    useEffect(() => {
        document.title = pageTitle
    }, [props, pageTitle]);

    async function apiTest() {
        try {
            let headers = {
                headers: {
                    Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
                },
            };
            await API.get('console', '/users', headers);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <main
            className={clsx(defaultClasses.content, {
                [defaultClasses.contentShift]: open,
            })}
        >
            <Container maxWidth={false} className={defaultClasses.container}>
                <Grid container spacing={3}>
                    {/* Chart */}
                    <Grid item xs={12} md={8} lg={9}>
                        <Paper className={clsx(defaultClasses.paper, classes.fixedHeight)}>
                            <ResponsiveContainer>
                                <LineChart
                                    width={500}
                                    height={300}
                                    data={data}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5
                                    }}>
                                    <XAxis dataKey="time" stroke={theme.palette.text.secondary} />
                                    <YAxis stroke={theme.palette.text.secondary}>
                                        <Label
                                            angle={270}
                                            position="left"
                                            style={{ textAnchor: "middle", fill: theme.palette.text.primary }}
                                        >
                                            Ratings
                                    </Label>
                                    </YAxis>
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="rating"
                                        stroke="green"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="rank"
                                        stroke="red"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                    {/* User Card */}
                    <Grid item xs={12} md={4} lg={3}>
                        <Paper className={clsx(defaultClasses.paper, classes.fixedHeight)}>
                            user card
                        </Paper>
                    </Grid>
                    {/* Submission Table */}
                    <Grid item xs={12}>
                        <Paper className={defaultClasses.paper}>
                            submission
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
            <Container className={defaultClasses.container} style={{ flexDirection: "column" }}>
                <Box pt={4}>
                    copyright
                </Box>
                <Button onClick={apiTest} variant="contained" color="secondary">API Test</Button>
            </Container>
        </main>
    )
}
