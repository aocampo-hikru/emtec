#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WhatsAppAiStack } from '../lib/WhatsAppAiStack';

const app = new cdk.App();
new WhatsAppAiStack(app, 'WhatsAppAiStack');
